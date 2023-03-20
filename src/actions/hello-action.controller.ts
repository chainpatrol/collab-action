// Copyright Abridged, Inc. 2023. All Rights Reserved.
// Node module: @collabland/example-hello-action
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
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

/**
 * HelloActionController is a LoopBack REST API controller that exposes endpoints
 * to support Collab Actions for Discord interactions.
 */
@injectable({
  scope: BindingScope.SINGLETON,
})
@api({basePath: '/hello-action'}) // Set the base path to `/hello-action`
export class HelloActionController extends BaseDiscordActionController<APIChatInputApplicationCommandInteraction> {
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
    console.log(interaction.data);

    const option = getSubCommandOption(interaction);

    switch (option?.name) {
      case 'check': {
        const url = getSubCommandOptionValue(interaction, 'check', 'url');
        const message = `You entered: ${url}!`;
        const response: APIInteractionResponse = buildSimpleResponse(
          message,
          true,
        );
        return response;
      }

      case 'report': {
        const url = getSubCommandOptionValue(interaction, 'report', 'url');
        const message = `You entered: ${url}!`;
        const response: APIInteractionResponse = buildSimpleResponse(
          message,
          true,
        );
        return response;
      }

      default: {
        throw new Error('Invalid subcommand');
      }
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
