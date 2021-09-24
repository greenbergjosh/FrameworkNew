import { EnrichedColumnDefinition } from "../../StandardGrid/types";
import { JSONRecord } from "../../../../../globalTypes/JSONTypes";
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
//# sourceMappingURL=count.d.ts.map