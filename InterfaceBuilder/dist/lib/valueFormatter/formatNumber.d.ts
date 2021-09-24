export import NumberFormatOptions = Intl.NumberFormatOptions;
import { DataType } from "./types";
declare type NumberFormatter = (value: number, precision?: number) => string;
/**
 *
 * @param rawValue
 * @param formatKey
 */
export declare function formatNumber(rawValue: DataType, formatKey?: string): string | null;
export declare const numberFormats: {
    [key: string]: NumberFormatOptions | NumberFormatter;
};
/**
 *
 * @param formatKey (e.g., "P2")
 */
export declare function getNumberFormatter(formatKey?: string): NumberFormatter;
export {};
//# sourceMappingURL=formatNumber.d.ts.map