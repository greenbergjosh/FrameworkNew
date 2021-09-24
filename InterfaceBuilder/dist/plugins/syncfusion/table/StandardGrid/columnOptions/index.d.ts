import { EnrichedColumnDefinition } from "../types";
/**
 * Defines the schema of columns. Add custom cell formatters, row detail templates, and aggregate functions.
 * Despite this being a bit odd in React, we only get one chance
 * at creating the columns array with the SyncFusion Grid.
 * We memoize it the first time, and then we can never regenerate columns
 * or else we'll get tons of exceptions in the grid.
 *
 * For Types see:
 * node_modules/@syncfusion/ej2-grids/src/grid/models/column.d.ts
 * node_modules/@syncfusion/ej2-base/src/internationalization.d.ts
 *
 * @param columns
 * @param useSmallFont
 */
export declare function getUsableColumns(columns: EnrichedColumnDefinition[], useSmallFont?: boolean): EnrichedColumnDefinition[];
//# sourceMappingURL=index.d.ts.map