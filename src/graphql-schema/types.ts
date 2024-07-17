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
interface GraphQLField {
    name: string;
    type: string;
    repeated: boolean;
}
interface GraphQLType {
    name: string;
    fields: GraphQLField[];
}

interface GraphQLEnum {
    name: string;
    values: string[];
}

interface GraphQLEndpoint {
    name: string;
    inputType: string;
    outputType: string;
}

interface GraphQLSchema {
    types: GraphQLType[];
    enums: GraphQLEnum[];
    queries: GraphQLEndpoint[];
    mutations: GraphQLEndpoint[];
    inputs: GraphQLType[];
}

export type {
    GraphQLType,
    GraphQLField,
    GraphQLEnum,
    GraphQLEndpoint,
    GraphQLSchema
};
