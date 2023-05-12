// Copyright Abridged, Inc. 2023. All Rights Reserved.
// Node module: @collabland/example-hello-action
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ActionEcdsaSignatureHeader,
  ActionSignatureTimestampHeader,
} from '@collabland/action';
import {getFetch} from '@collabland/common';
import {expect, givenHttpServerConfig} from '@loopback/testlab';
import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord.js';
import {ChainPatrolActionApplication} from '../../application.js';
import {MOCKED_INTERACTION, main as client} from '../../client.js';
import {main as server} from '../../server.js';

describe('ChainPatrolAction - ecdsa', () => {
  let app: ChainPatrolActionApplication;
  let signingKey: string;

  before('setupApplication', async () => {
    const restConfig = givenHttpServerConfig({});
    ({app, signingKey} = await server({rest: restConfig}, 'ecdsa'));
  });

  after(async () => {
    await app.stop();
  });

  it('reports error if signature is missing', async () => {
    const fetch = getFetch();
    const res = await fetch(
      app.restServer.url + '/chainpatrol-action/interactions',
      {
        method: 'post',
        body: JSON.stringify({
          interaction: MOCKED_INTERACTION,
        }),
        headers: {
          [ActionSignatureTimestampHeader]: Date.now().toString(),
        },
      },
    );
    expect(res.status).to.eql(400);
  });

  it('reports error if timestamp is missing', async () => {
    const fetch = getFetch();
    const res = await fetch(
      app.restServer.url + '/chainpatrol-action/interactions',
      {
        method: 'post',
        body: JSON.stringify({
          interaction: MOCKED_INTERACTION,
        }),
        headers: {
          [ActionEcdsaSignatureHeader]: 'dummy-signature',
        },
      },
    );
    expect(res.status).to.eql(400);
  });

  it('reports error if signature is invalid', async () => {
    const fetch = getFetch();
    const res = await fetch(
      app.restServer.url + '/chainpatrol-action/interactions',
      {
        method: 'post',
        body: JSON.stringify({
          interaction: MOCKED_INTERACTION,
        }),
        headers: {
          [ActionSignatureTimestampHeader]: Date.now().toString(),
          [ActionEcdsaSignatureHeader]: 'dummy-signature',
        },
      },
    );
    expect(res.status).to.eql(401);
  });

  it('invokes action with ecdsa signature', async () => {
    const result = await client(
      app.restServer.url + '/chainpatrol-action',
      signingKey,
    );
    expect(result.metadata.applicationCommands).to.eql([
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
              'Report a scam URL to ChainPatrol. Once configured, reports will show up in your custom admin dashboard on ChainPatrol with the Discord username associated with the report.',
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
