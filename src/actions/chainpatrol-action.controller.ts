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
        name: 'ChainPatrolAction',
        platforms: ['discord'],
        shortName: 'chainpatrol-action',
        version: {name: '0.0.1'},
        website: 'https://chainpatrol.io',
        description: 'The official ChainPatrol Collab Action for Discord',
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
      // check url
      const response = await axios.post(
        'https://app.chainpatrol.io/api/v2/asset/check',
        {
          type: 'URL',
          content: url,
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
      const guildId = interaction.guild_id;
      const user = interaction.member!.user; // Bot should only be installed in a guild

      // submit report
      const response = await axios.post(
        'https://app.chainpatrol.io/api/v2/report/create',
        {
          discordGuildId: guildId,
          title: 'Discord Report',
          description: `reported by discord user ${user.username} , Discord ID: ${user.id}`,
          contactInfo: `discord user ${user.username} , Discord ID: ${user.id}`,
          assets: [
            {
              content: url,
              status: 'BLOCKED',
              type: 'URL',
            },
          ],
          attachmentUrls: [],
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
        description: 'Security and scam prevention for web3 communities',
        options: [
          // `/chainpatrol check <url>` slash command
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'check',
            description: 'Check if a URL is a scam',
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
            description: 'Report a scam URL',
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
