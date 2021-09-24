import { ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
import { UserInterfaceProps } from "../../../UserInterface";
import { LoadStatusType, LocalDataHandlerType } from "./Selectable.types";
import { SelectableChildProps } from "./SelectableChild.interfaces";
export interface SelectableOption {
    label: string;
    value: string;
    icon?: string;
}
export interface ISelectableProps extends ComponentDefinitionNamedProps {
    allowCreateNew?: boolean;
    createNewLabel: string;
    defaultValue?: string;
    disabled?: boolean;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    valuePrefix?: string;
    valueSuffix?: string;
    dataHandlerType: LocalDataHandlerType;
    data: {};
    children: (props: SelectableChildProps) => JSX.Element | JSX.Element[] | null;
}
export interface SelectablePropsLocalData extends ISelectableProps {
    dataHandlerType: "local";
    data: {
        values: SelectableOption[];
    };
}
export interface SelectableState {
    loadError: string | null;
    loadStatus: LoadStatusType;
    options: SelectableOption[];
}
//# sourceMappingURL=Selectable.interfaces.d.ts.map