// Copyright Abridged, Inc. 2023. All Rights Reserved.
// Node module: @collabland/example-hello-action
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandOptionType,
  ApplicationCommandSpec,
  ApplicationCommandType,
  BaseDiscordActionController,
  buildSimpleResponse,
  DiscordActionMetadata,
  DiscordActionRequest,
  DiscordActionResponse,
  DiscordInteractionPattern,
  getSubCommandOption,
  getSubCommandOptionValue,
  InteractionType,
} from '@collabland/discord';
import {MiniAppManifest} from '@collabland/models';
import {BindingScope, injectable} from '@loopback/core';
import {api} from '@loopback/rest';
import axios from 'axios';

/**
 * ChainPatrolActionController is a LoopBack REST API controller that exposes endpoints
 * to support Collab Actions for Discord interactions.
 */
@injectable({
  scope: BindingScope.SINGLETON,
})
@api({basePath: '/chainpatrol-action'}) // Set the base path to `/chainpatrol-action`
export class ChainPatrolActionController extends BaseDiscordActionController<APIChatInputApplicationCommandInteraction> {
  /**
   * Expose metadata for the action
   * @returns
   */
  async getMetadata(): Promise<DiscordActionMetadata> {
    const metadata: DiscordActionMetadata = {
      /**
       * Miniapp manifest
       */
      manifest: new MiniAppManifest({
        appId: 'chainpatrol-action',
        developer: 'chainpatrol.io',
        name: 'ChainPatrol',
        platforms: ['discord'],
        shortName: 'chainpatrol-action',
        version: {name: '0.0.1'},
        website: 'https://chainpatrol.io',
        description: `[ChainPatrol](https://chainpatrol.io/) adds security tools to protect your Web3 community from scams

**To get started:**

1. Install the ChainPatrol Miniapp from the Collab.Land Marketplace.

2. (OPTIONAL) [Reach out to the ChainPatrol team](https://chainpatrol.io/onboard/collab-land) to get a custom admin dashboard associated to your server where you can review reports and track which community members are helping protect your server.

3. Your community members can then use \`/chainpatrol check\` to check suspect URLs against the global scam list if they see any suspicious messages.

4. They can also report scams to ChainPatrol using the \`/chainpatrol report\` command and we'll investigate the report. If we find the report to be credible, we'll add the URL to our global scam list that is used by wallets like Coinbase and MetaMask to protect all of Web3. Help us protect the whole Web3 community by reporting scams to wallets!

If you need more help setting up your ChainPatrol mini-app, please refer to the [supporting documentation here](https://help.collab.land/marketplace/apps/chainpatrol).
`,
        shortDescription:
          'ChainPatrol adds security tools to protect your Web3 community from scams',
        icons: [
          {
            label: 'App icon',
            src: 'https://chainpatrol-collab-action-development.up.railway.app/chainpatrol-logo.png',
            sizes: '512x512',
          },
        ],
        category: 'Security',
        keywords: ['security', 'chainpatrol', 'discord'],
      }),
      /**
       * Supported Discord interactions. They allow Collab.Land to route Discord
       * interactions based on the type and name/custom-id.
       */
      supportedInteractions: this.getSupportedInteractions(),
      /**
       * Supported Discord application commands. They will be registered to a
       * Discord guild upon installation.
       */
      applicationCommands: this.getApplicationCommands(),
    };
    return metadata;
  }

  /**
   * Handle the Discord interaction
   * @param interaction - Discord interaction with Collab Action context
   * @returns - Discord interaction response
   */
  protected async handle(
    interaction: DiscordActionRequest<APIChatInputApplicationCommandInteraction>,
  ): Promise<DiscordActionResponse> {
    const option = getSubCommandOption(interaction);

    console.log(`handling interaction (option.name=${option?.name})`);

    switch (option?.name) {
      case 'check': {
        const url = getSubCommandOptionValue(interaction, 'check', 'url');

        if (!url) {
          throw new Error('Invalid URL');
        }

        return this.handleCheckCommand({url});
      }

      case 'report': {
        const url = getSubCommandOptionValue(interaction, 'report', 'url');

        if (!url) {
          throw new Error('Invalid URL');
        }

        return this.handleReportCommand({url, interaction});
      }

      default: {
        throw new Error('Invalid subcommand');
      }
    }
  }

  private async handleCheckCommand({
    url,
  }: {
    url: string;
  }): Promise<DiscordActionResponse> {
    const escapedUrl = url.replace('.', '(dot)');

    try {
      console.log(`checking url (url=${escapedUrl}`);

      // check url
      const response = await axios.post(
        'https://app.chainpatrol.io/api/v2/asset/check',
        {
          type: 'URL',
          content: url,
        },
        {
          headers: {
            'X-API-KEY': process.env.CHAINPATROL_API_KEY,
          },
        },
      );

      if (response.data.status === 'BLOCKED') {
        return buildSimpleResponse(
          `🚨 **Alert** 🚨 \n\nThis link is a scam! \`${escapedUrl}\` \n\n_Please **DO NOT** click on this link._`,
        );
      } else if (response.data.status === 'ALLOWED') {
        return buildSimpleResponse(
          `✅ This link looks safe! \`${escapedUrl}\``,
        );
      } else if (response.data.status === 'UNKNOWN') {
        return buildSimpleResponse(
          `⚠️ **Warning** ⚠️ \n\nThis link is not currently in our database: \`${escapedUrl}\` \n\n_Please be careful and **DO NOT** click on this link unless you are sure it's safe._`,
        );
      } else {
        return buildSimpleResponse(
          `❓ We're not sure about this link. \`${escapedUrl}\``,
        );
      }
    } catch (error) {
      // Handle errors
      console.error('error', error);
      return buildSimpleResponse('Error with checking link');
    }
  }

  private async handleReportCommand({
    url,
    interaction,
  }: {
    url: string;
    interaction: DiscordActionRequest<APIChatInputApplicationCommandInteraction>;
  }): Promise<DiscordActionResponse> {
    const escapedUrl = url.replace('.', '(dot)');

    try {
      console.log(`reporting url (url=${escapedUrl}`);

      const guildId = interaction.guild_id;
      const user = interaction.member!.user; // Bot should only be installed in a guild

      // submit report
      const response = await axios.post(
        'https://app.chainpatrol.io/api/v2/report/create',
        {
          discordGuildId: guildId,
          title: 'Discord Report',
          description: `reported by discord user ${user.username}:${user.discriminator} , Discord ID: ${user.id}`,
          contactInfo: `discord user ${user.username}:${user.discriminator} , Discord ID: ${user.id}`,
          assets: [
            {
              content: url,
              status: 'BLOCKED',
              type: 'URL',
            },
          ],
          attachmentUrls: [],
        },
        {
          headers: {
            'X-API-KEY': process.env.CHAINPATROL_API_KEY,
          },
        },
      );

      return buildSimpleResponse(
        `✅ Thanks for submitting a report for \`${escapedUrl}\` ! \n\nWe've sent this report to the **${response.data.organization.name}** team and **ChainPatrol** to conduct a review. Once approved the report will be sent out to wallets to block.\n\nThanks for doing your part in making this space safer 🚀`,
      );
    } catch (error) {
      // Handle errors
      console.error('error', error);
      return buildSimpleResponse('⚠️ Error with submitting report');
    }
  }

  /**
   * Build a list of supported Discord interactions
   * @returns
   */
  private getSupportedInteractions(): DiscordInteractionPattern[] {
    return [
      // Handle `/chainpatrol` slash command
      {
        type: InteractionType.ApplicationCommand,
        names: ['chainpatrol'],
      },
    ];
  }

  /**
   * Build a list of Discord application commands. It's possible to use tools
   * like https://autocode.com/tools/discord/command-builder/.
   * @returns
   */
  private getApplicationCommands(): ApplicationCommandSpec[] {
    const commands: ApplicationCommandSpec[] = [
      {
        metadata: {
          name: 'ChainPatrol',
          shortName: 'chainpatrol',
          supportedEnvs: ['dev', 'qa', 'staging'],
        },
        name: 'chainpatrol',
        type: ApplicationCommandType.ChatInput,
        description: 'Security and scam prevention tools for web3 communities',
        options: [
          // `/chainpatrol check <url>` slash command
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'check',
            description:
              "Check a URL against ChainPatrol's blocklist of known phishing sites.",
            options: [
              {
                type: ApplicationCommandOptionType.String,
                name: 'url',
                description: 'The URL to check for scams',
                required: true,
              },
            ],
          },

          // `/chainpatrol report <url>` slash command
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'report',
            description:
              'Report a scam URL to ChainPatrol for review to add to the global blocklist.',
            options: [
              {
                type: ApplicationCommandOptionType.String,
                name: 'url',
                description: 'The URL of the scam to report',
                required: true,
              },
            ],
          },
        ],
      },
    ];
    return commands;
  }
}
