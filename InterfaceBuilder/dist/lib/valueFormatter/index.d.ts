import { CoerceableDataType, DataType } from "./types";
export { DurationUnits } from "./types";
export { durationFormats } from "./formatDuration";
/**
 *
 * @param coerceToType
 * @param rawFormat (e.g., "P2")
 * @param rawValue
 */
export declare function formatValue(rawValue: DataType, rawFormat?: string, coerceToType?: CoerceableDataType): string | null;
//# sourceMappingURL=index.d.ts.map