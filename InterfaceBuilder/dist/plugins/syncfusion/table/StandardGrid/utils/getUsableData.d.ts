import { JSONRecord } from "../../../../../globalTypes/JSONTypes";
import { EnrichedColumnDefinition } from "../../StandardGrid/types";
/**
 * Some data may have to be pre-processed in order not to cause the table to fail to render
 * @param data
 * @param columns
 */
export declare function getUsableData(data: JSONRecord[], columns: EnrichedColumnDefinition[]): JSONRecord[];
//# sourceMappingURL=getUsableData.d.ts.map