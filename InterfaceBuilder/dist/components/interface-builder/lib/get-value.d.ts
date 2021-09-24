import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
/**
 * Gets the value from local or root UI data.
 * Provide the "root." keyword at the beginning of the valueKey to use root UI data.
 * @param valueKey
 * @param userInterfaceData
 * @param getRootUserInterfaceData
 */
export declare function getValue(valueKey: string, userInterfaceData: UserInterfaceProps["data"], getRootUserInterfaceData: () => UserInterfaceProps["data"]): JSONRecord | JSONRecord[] | undefined;
//# sourceMappingURL=get-value.d.ts.map