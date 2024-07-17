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
    DescriptorProto,
    EnumDescriptorProto,
    FieldDescriptorProto,
    FileDescriptorProto
} from 'google-protobuf/google/protobuf/descriptor_pb';

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
}

const asFieldType = (field: FieldDescriptorProto): string => {
    switch (field.getType()) {
        case FieldDescriptorProto.Type.TYPE_DOUBLE:
        case FieldDescriptorProto.Type.TYPE_FLOAT:
            return 'Float';
        case FieldDescriptorProto.Type.TYPE_INT32:
        case FieldDescriptorProto.Type.TYPE_INT64:
        case FieldDescriptorProto.Type.TYPE_UINT32:
        case FieldDescriptorProto.Type.TYPE_UINT64:
        case FieldDescriptorProto.Type.TYPE_SINT32:
        case FieldDescriptorProto.Type.TYPE_SINT64:
        case FieldDescriptorProto.Type.TYPE_FIXED32:
        case FieldDescriptorProto.Type.TYPE_FIXED64:
        case FieldDescriptorProto.Type.TYPE_SFIXED32:
        case FieldDescriptorProto.Type.TYPE_SFIXED64:
            return 'Int';
        case FieldDescriptorProto.Type.TYPE_BOOL:
            return 'Boolean';
        case FieldDescriptorProto.Type.TYPE_STRING:
        case FieldDescriptorProto.Type.TYPE_BYTES:
            return 'String';
        case FieldDescriptorProto.Type.TYPE_MESSAGE:
        case FieldDescriptorProto.Type.TYPE_ENUM: {
            const lastDot = field.getTypeName()?.lastIndexOf('.') ?? 1;
            return field.getTypeName()?.slice(lastDot + 1) ?? '';
        }
        default:
            return 'String';
    }
};

const asField = (field: FieldDescriptorProto): GraphQLField => {
    return {
        name: field.getName() ?? '',
        type: asFieldType(field),
        repeated: field.getLabel() === FieldDescriptorProto.Label.LABEL_REPEATED
    };
};

const asType = (proto: DescriptorProto): GraphQLType => {
    return {
        name: proto.getName() ?? '',
        fields: proto.getFieldList().map(asField)
    };
};

const asEnum = (proto: EnumDescriptorProto): GraphQLEnum => {
    return {
        name: proto.getName() ?? '',
        values: proto.getValueList().map((value) => value.getName() ?? '')
    };
};

const fieldsToSchemaString = (fields: GraphQLField[]): string => {
    return fields
        .map((field) => {
            const type = field.repeated ? `[${field.type}]` : field.type;
            return `    ${field.name}: ${type}`;
        })
        .join('\n');
};

const typesToSchemaString = (types: GraphQLType[]): string => {
    return types
        .map((type) => {
            const fields = fieldsToSchemaString(type.fields);
            return `type ${type.name} {\n${fields}\n}`;
        })
        .join('\n\n');
};

const enumsToSchemaString = (enums: GraphQLEnum[]): string => {
    return enums
        .map((enumType) => {
            const values = enumType.values
                .map((value) => `    ${value}`)
                .join('\n');
            return `enum ${enumType.name} {\n${values}\n}`;
        })
        .join('\n\n');
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

const asSchema = (proto: FileDescriptorProto): GraphQLSchema => {
    const types = proto.getMessageTypeList().map(asType);
    const enums = proto.getEnumTypeList().map(asEnum);
    const queries: GraphQLEndpoint[] = [];
    const mutations: GraphQLEndpoint[] = [];
    return { types, enums, queries, mutations };
};

const toSchemaString = (schema: GraphQLSchema): string => {
    const withTypes = typesToSchemaString(schema.types);
    const withEnums = enumsToSchemaString(schema.enums);
    const withQueries = queriesToSchemaString(schema.queries);
    const withMutations = mutationsToSchemaString(schema.mutations);
    return `${withTypes}\n\n${withEnums}\n\n${withQueries}\n\n${withMutations}`;
};

export { asSchema, toSchemaString };
export type { GraphQLType, GraphQLField, GraphQLEnum };
