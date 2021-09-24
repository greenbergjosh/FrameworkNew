import { JSONRecord } from "../globalTypes/JSONTypes";
import { UserInterfaceProps } from "../globalTypes";
/**
 * Gets the value from local or root UI data.
 * Provide the "root." keyword at the beginning of the valueKey to use root UI data.
 * @param valueKey
 * @param userInterfaceData
 * @param getRootUserInterfaceData
 */
export declare function getValue(valueKey: string, userInterfaceData: UserInterfaceProps["data"], getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]): JSONRecord | JSONRecord[] | undefined;
//# sourceMappingURL=getValue.d.ts.map