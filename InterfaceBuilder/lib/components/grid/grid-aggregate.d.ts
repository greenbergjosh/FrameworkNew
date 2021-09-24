import { JSONRecord } from "../interface-builder/@types/JSONTypes";
import { EnrichedColumnDefinition } from "./grid-types";
export declare const count: (columns: EnrichedColumnDefinition[], data: JSONRecord[]) => {
    [key: string]: number;
};
export declare const average: (columns: EnrichedColumnDefinition[], data: JSONRecord[], counts?: {
    [key: string]: number;
} | undefined) => {
    [key: string]: number;
};
export declare const flattenDataItems: (data: any) => any;
//# sourceMappingURL=grid-aggregate.d.ts.map