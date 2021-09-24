import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { DataType } from "./types";
declare type DateTimeFormatter = (value: Date) => string;
/**
 *
 * @param rawValue
 * @param formatKey
 */
export declare function formatDate(rawValue: DataType, formatKey?: string): string | null;
export declare const dateTimeFormats: {
    [key: string]: DateTimeFormatOptions | DateTimeFormatter;
};
/**
 *
 * @param formatKey (e.g., "D")
 */
export declare function getDateTimeFormatter(formatKey?: string): DateTimeFormatter;
export declare function coerceDate(rawValue: DataType): Date | null;
export {};
//# sourceMappingURL=formatDate.d.ts.map