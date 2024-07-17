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
    GraphQLEndpoint,
    GraphQLEnum,
    GraphQLField,
    GraphQLSchema,
    GraphQLType
} from './types';

const schemaToString = (schema: GraphQLSchema) => {
    const withTypes = definitionsToSchemaString('type', schema.types);
    const withInputs = definitionsToSchemaString('input', schema.inputs);
    const withEnums = enumsToSchemaString(schema.enums);
    const withQuery = queriesToSchemaString(schema.queries);
    const withMutation = mutationsToSchemaString(schema.mutations);
    return [withTypes, withEnums, withInputs, withQuery, withMutation]
        .filter((str) => str.length > 0)
        .join('\n\n')
        .trim();
};

const definitionsToSchemaString = (
    definition: 'input' | 'type',
    types: GraphQLType[]
): string => {
    if (types.length === 0) {
        return '';
    }
    return types
        .map((type) => {
            const fields = fieldsToSchemaString(type.fields);
            return `${definition} ${type.name} {\n${fields}\n}`;
        })
        .join('\n\n')
        .trim();
};

const fieldsToSchemaString = (fields: GraphQLField[]): string => {
    return fields
        .map((field) => {
            const type = field.repeated ? `[${field.type}]` : field.type;
            return `    ${field.name}: ${type}`;
        })
        .join('\n');
};

const enumsToSchemaString = (enums: GraphQLEnum[]): string => {
    return enums
        .map((enumType) => {
            const values = enumType.values
                .map((value) => `    ${value}`)
                .join('\n');
            return `enum ${enumType.name} {\n${values}\n}`;
        })
        .join('\n\n')
        .trim();
};

const endpointsToSchemaString = (endpoints: GraphQLEndpoint[]): string => {
    return endpoints
        .map((endpoint) => {
            return `    ${endpoint.name}(input: ${endpoint.inputType}): ${endpoint.outputType}`;
        })
        .join('\n');
};

const queriesToSchemaString = (queries: GraphQLEndpoint[]): string => {
    if (queries.length === 0) {
        return '';
    }
    return `type Query {\n${endpointsToSchemaString(queries)}\n}`;
};

const mutationsToSchemaString = (mutations: GraphQLEndpoint[]): string => {
    if (mutations.length === 0) {
        return '';
    }
    return `type Mutation {\n${endpointsToSchemaString(mutations)}\n}`;
};

export { schemaToString };
