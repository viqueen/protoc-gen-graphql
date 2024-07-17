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
    FileDescriptorProto,
    ServiceDescriptorProto
} from 'google-protobuf/google/protobuf/descriptor_pb';

import {
    GraphQLEndpoint,
    GraphQLEnum,
    GraphQLField,
    GraphQLSchema,
    GraphQLType
} from './types';

const protoToSchema = (proto: FileDescriptorProto): GraphQLSchema => {
    const services = proto.getServiceList().map(asService);
    const allTypes = proto.getMessageTypeList().map(asType);
    const enums = proto.getEnumTypeList().map(asEnum);
    const queries: GraphQLEndpoint[] = services.flatMap(
        (service) => service.queries
    );
    const mutations: GraphQLEndpoint[] = services.flatMap(
        (service) => service.mutations
    );
    const inputTypeNames = services.flatMap(
        (service) => service.inputTypeNames
    );

    const filteredTypes = allTypes.filter(
        (type) => !inputTypeNames.includes(type.name)
    );
    const inputTypes = allTypes.filter((type) =>
        inputTypeNames.includes(type.name)
    );
    return {
        types: filteredTypes,
        inputs: inputTypes,
        enums,
        queries,
        mutations
    };
};

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
            return asMessageTypeName(field.getTypeName());
        }
        default:
            return 'String';
    }
};

const asMessageTypeName = (name?: string): string => {
    const lastDot = name?.lastIndexOf('.') ?? 1;
    return name?.slice(lastDot + 1) ?? '';
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

interface GraphQLService {
    queries: GraphQLEndpoint[];
    mutations: GraphQLEndpoint[];
    inputTypeNames: string[];
}

const asService = (proto: ServiceDescriptorProto): GraphQLService => {
    const queries: GraphQLEndpoint[] = [];
    const mutations: GraphQLEndpoint[] = [];
    const inputTypeNames: string[] = [];

    proto.getMethodList().forEach((method) => {
        const endpoint: GraphQLEndpoint = {
            name: method.getName() ?? '',
            inputType: asMessageTypeName(method.getInputType()),
            outputType: asMessageTypeName(method.getOutputType())
        };
        inputTypeNames.push(endpoint.inputType);
        if (isQuery(endpoint.name)) {
            queries.push(endpoint);
        } else if (isMutation(endpoint.name)) {
            mutations.push(endpoint);
        } else {
            console.error(`Unknown endpoint type: ${endpoint.name}`);
        }
    });

    return {
        queries,
        mutations,
        inputTypeNames
    };
};

const isQuery = (name: string): boolean => {
    const isGet = name.startsWith('Get');
    const isList = name.startsWith('List');
    return isGet || isList;
};

const isMutation = (name: string): boolean => {
    const iCreate = name.startsWith('Create');
    const iUpdate = name.startsWith('Update');
    const iDelete = name.startsWith('Delete');
    return iCreate || iUpdate || iDelete;
};

export { protoToSchema };
