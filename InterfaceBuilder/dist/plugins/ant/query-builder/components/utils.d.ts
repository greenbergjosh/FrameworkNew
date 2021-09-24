import { Config, JsonTree } from "react-awesome-query-builder";
import { SchemaType } from "../types";
/**
 *
 * @param schema - User defined fields to add to the config.
 */
export declare function getConfig(schema?: SchemaType): Config;
export declare const emptyQBDataJsonTree: JsonTree;
declare type QueryableFieldOption = {
    label: string;
    value: string;
};
export declare function getQueryableFields(schema: SchemaType): QueryableFieldOption[];
export {};
//# sourceMappingURL=utils.d.ts.map