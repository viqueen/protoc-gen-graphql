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

import {
    GraphQLEndpoint,
    GraphQLEnum,
    GraphQLField,
    GraphQLSchema,
    GraphQLType
} from './types';

const protoToSchema = (proto: FileDescriptorProto): GraphQLSchema => {
    const types = proto.getMessageTypeList().map(asType);
    const enums = proto.getEnumTypeList().map(asEnum);
    const queries: GraphQLEndpoint[] = [];
    const mutations: GraphQLEndpoint[] = [];
    return { types, enums, queries, mutations };
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

export { protoToSchema };
