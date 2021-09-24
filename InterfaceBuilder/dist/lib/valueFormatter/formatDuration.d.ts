import moment from "moment";
import { DataType } from "./types";
declare type DurationFormatter = (value: moment.Duration, precision?: number) => string;
/**
 *
 * @param rawValue
 * @param formatKey
 */
export declare function formatDuration(rawValue: DataType, formatKey?: string): string | null;
export declare const durationFormats: {
    [key: string]: DurationFormatter;
};
export declare function isDuration(formatKey?: string): boolean;
/**
 *
 * @param formatKey (e.g., "P2")
 */
export declare function getDurationFormatter(formatKey?: string): DurationFormatter;
export {};
//# sourceMappingURL=formatDuration.d.ts.map