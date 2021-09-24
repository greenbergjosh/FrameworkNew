import { TableInterfaceComponentEditModeProps } from "../types";
import { UserInterfaceProps } from "components/interface-builder/UserInterface";
interface AbstractTableProps extends Partial<TableInterfaceComponentEditModeProps> {
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
}
/**
 * Abstract Table
 * Defines a table to be used on child configs. Child configs
 * that use this table cannot edit the abstract table's
 * basic settings (settings popup), but may edit its columns.
 */
export declare function AbstractTable({ onChangeData, userInterfaceData, getRootUserInterfaceData, valueKey, }: AbstractTableProps): JSX.Element;
export {};
//# sourceMappingURL=AbstractTable.d.ts.map