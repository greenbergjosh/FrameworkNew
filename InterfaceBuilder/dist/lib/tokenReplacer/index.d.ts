import { DataType } from "../../lib/valueFormatter/types";
import { UserInterfaceProps } from "../../globalTypes";
/**
 *
 * @param stringTemplate
 * @param data
 * @param rootValueKey
 * @param mode
 */
export declare function replaceTokens<T extends DataType>(stringTemplate: string, data: DataType, rootValueKey: string, mode: UserInterfaceProps["mode"]): T;
/**
 *
 * @param stringTemplate
 */
export declare function hasTokens(stringTemplate: string): boolean;
//# sourceMappingURL=index.d.ts.map