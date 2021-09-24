import { ColumnModel } from "@syncfusion/ej2-react-grids";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
import { EnrichedColumnDefinition } from "./types";
/**
 * Some data may have to be pre-processed in order not to cause the table to fail to render
 * @param data
 * @param columns
 */
export declare function getUsableData(data: JSONRecord[], columns: ColumnModel[]): JSONRecord[];
/**
 * Defines the schema of dataSource.
 * Despite this being a bit odd in React, we only get one chance
 * at creating the columns array with the SyncFusion Grid.
 * We memoize it the first time, and then we can never regenerate columns
 * or else we'll get tons of exceptions in the grid.
 * @param columns
 */
export declare function getUsableColumns(columns: ColumnModel[], useSmallFont?: boolean): EnrichedColumnDefinition[];
/**
 *
 * @param columns
 * @param data
 */
export declare const count: (columns: EnrichedColumnDefinition[], data: JSONRecord[]) => {
    [key: string]: number;
};
/**
 *
 * @param columns
 * @param data
 * @param counts
 */
export declare const average: (columns: EnrichedColumnDefinition[], data: JSONRecord[], counts?: {
    [key: string]: number;
} | undefined) => {
    [key: string]: number;
};
/**
 *
 * @param data
 */
export declare const flattenDataItems: (data: any[] | {
    items: any[];
} | any) => any;
//# sourceMappingURL=utils.d.ts.map