#!/usr/bin/env node

/**
 * Copyright 2024 viqueen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Command } from 'commander';
import concatStream from 'concat-stream';

import { pluginHandler } from './lib/plugin-handler';

const program = new Command();

program
    .name('protoc-gen-graphql')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require('../package.json').version)
    .description('Generate GraphQL schema from Protobuf definitions')
    .action(async () => {
        process.stdin.pipe(concatStream(pluginHandler));
    });

program.parse(process.argv);
