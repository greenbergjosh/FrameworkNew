import React from "react";
import { JSONRecord } from "../interface-builder/@types/JSONTypes";
import { ColumnModel, GridComponent, GroupSettingsModel, SortSettingsModel } from "@syncfusion/ej2-react-grids";
export interface StandardGridComponentProps {
    allowAdding?: boolean;
    allowDeleting?: boolean;
    allowEditing?: boolean;
    columns: ColumnModel[];
    data: JSONRecord[];
    contextData?: JSONRecord;
    detailTemplate?: string | Function | any;
    loading?: boolean;
    sortSettings?: SortSettingsModel;
    groupSettings?: GroupSettingsModel;
}
export declare const StandardGrid: React.ForwardRefExoticComponent<StandardGridComponentProps & React.RefAttributes<GridComponent>>;
//# sourceMappingURL=StandardGrid.d.ts.map