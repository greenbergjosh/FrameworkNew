import { TableInterfaceComponentEditModeProps } from "../types";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
interface EditTableProps extends Partial<TableInterfaceComponentEditModeProps> {
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
}
/**
 * Edit Table
 * User may define the columns with data types, etc.
 */
export declare function EditTable({ onChangeData, onChangeSchema, rowDetails, userInterfaceData, getRootUserInterfaceData, userInterfaceSchema, valueKey, }: EditTableProps): JSX.Element;
export {};
//# sourceMappingURL=EditTable.d.ts.map