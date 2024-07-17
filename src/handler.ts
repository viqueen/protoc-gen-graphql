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
import {
    CodeGeneratorRequest,
    CodeGeneratorResponse
} from 'google-protobuf/google/protobuf/compiler/plugin_pb';

import { asEnum, asType, toSchemaString } from './graphql-schema';

const handler = (input: Buffer) => {
    const typedArray = new Uint8Array(input);
    const request = CodeGeneratorRequest.deserializeBinary(typedArray);
    const response = new CodeGeneratorResponse();
    request.getProtoFileList().forEach((protoFile) => {
        const messages = protoFile.getMessageTypeList();
        const enums = protoFile.getEnumTypeList();

        const schema = {
            types: messages.map(asType),
            enums: enums.map(asEnum)
        };

        const inputFileName = protoFile.getName() ?? '';
        const outputFilName = inputFileName.replace(/\.proto$/, '.graphql');
        const file = new CodeGeneratorResponse.File();
        file.setName(outputFilName);
        file.setContent(toSchemaString(schema));
        response.addFile(file);
    });
    process.stdout.write(Buffer.from(response.serializeBinary()));
};

export { handler };
