// Copyright Abridged, Inc. 2023. All Rights Reserved.
// Node module: @collabland/example-hello-action
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, givenHttpServerConfig} from '@loopback/testlab';
import {ApplicationCommandOptionType} from 'discord.js';
import {ChainPatrolActionApplication} from '../../application.js';
import {main as client} from '../../client.js';
import {main} from '../../server.js';

describe('ChainPatrolAction - ed25519', () => {
  let app: ChainPatrolActionApplication;
  let signingKey: string;

  before('setupApplication', async () => {
    const restConfig = givenHttpServerConfig({});
    ({app, signingKey} = await main({rest: restConfig}, 'ed25519'));
  });

  after(async () => {
    await app.stop();
  });

  it('invokes action with ecdsa signature', async () => {
    const result = await client(
      app.restServer.url + '/chainpatrol-action',
      'ed25519:' + signingKey,
    );
    expect(result.metadata.applicationCommands).to.eql([
      {
        metadata: {
          name: 'ChainPatrol',
          shortName: 'chainpatrol',
          supportedEnvs: ['dev', 'qa', 'staging'],
        },
        name: 'chainpatrol',
        type: 1,
        description: 'Security and scam prevention tools for web3 communities',
        options: [
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
    ]);
    expect(result.response).to.eql({
      type: 4,
      data: {
        content:
          '🚨 **Alert** 🚨 \n\nThis link is a scam! `metamask(dot)com` \n\n_Please **DO NOT** click on this link._',
        flags: 64,
      },
    });
  });
});
