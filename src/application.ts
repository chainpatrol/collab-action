// Copyright Abridged, Inc. 2023. All Rights Reserved.
// Node module: @collabland/example-hello-action
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {getEnvVar, getEnvVarAsNumber} from '@collabland/common';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import path from 'path';
import {ChainPatrolActionComponent} from './component.js';

/**
 * A demo application to expose REST APIs for ChainPatrol action
 */
export class ChainPatrolActionApplication extends RestApplication {
  constructor(config?: ApplicationConfig) {
    super(ChainPatrolActionApplication.resolveConfig(config));
    this.component(ChainPatrolActionComponent);
    this.static('/', path.join(__dirname, '../public'));
  }

  private static resolveConfig(config?: ApplicationConfig): ApplicationConfig {
    return {
      ...config,
      rest: {
        port: getEnvVarAsNumber('PORT', 3000),
        host: getEnvVar('HOST'),
        ...config?.rest,
      },
    };
  }
}
