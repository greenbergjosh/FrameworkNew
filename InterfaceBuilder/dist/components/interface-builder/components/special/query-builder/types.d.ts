import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
import { FieldOrGroup, JsonGroup, JsonLogicResult, JsonLogicTree, TypedMap } from "react-awesome-query-builder";
export declare type SchemaType = TypedMap<FieldOrGroup>;
export declare type QueryBuilderError = {
    type: "data-read";
    message: string;
};
export interface QueryBuilderInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "query-builder";
    defaultValue?: string;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    valueKey: string;
    mode: UserInterfaceProps["mode"];
    jsonLogicKey: string;
    schemaKey: string;
    exposeQueryableFields: boolean;
    queryableFieldsKey?: string;
    isParseJsonLogic?: boolean;
    isParseQBData?: boolean;
    isParseSchema?: boolean;
    onError?: (e: QueryBuilderError) => void;
}
export interface QueryBuilderInterfaceComponentState {
    schema?: SchemaType;
    jsonLogic?: JsonLogicTree | string;
    qbDataJsonGroup?: JsonGroup;
}
export declare type OnChangePayloadType = {
    jsonLogic: JsonLogicResult["logic"];
    errors: JsonLogicResult["errors"];
    data: JsonLogicResult["data"];
    qbDataJsonGroup: JsonGroup;
};
export interface QueryBuilderProps {
    schema?: SchemaType;
    jsonLogic?: JsonLogicTree;
    qbDataJsonGroup?: JsonGroup;
    onChange: (result: OnChangePayloadType) => void;
    onError?: (e: QueryBuilderError) => void;
}
//# sourceMappingURL=types.d.ts.map