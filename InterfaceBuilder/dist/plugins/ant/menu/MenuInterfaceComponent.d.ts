import React from "react";
import { ClickParam } from "antd/lib/menu";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { SelectableProps } from "../_shared/selectable/types";
import { LayoutDefinition } from "../../../globalTypes";
/******************************
 * Interfaces, Types, Enums
 */
export interface SelectState {
    selectedKey?: string;
    searchText?: string;
}
export interface IMenuProps {
    resultLimit?: number;
    searchPlaceholder?: string;
}
export declare type MenuProps = SelectableProps & IMenuProps;
/******************************
 * Component
 */
export declare class MenuInterfaceComponent extends BaseInterfaceComponent<MenuProps, SelectState> {
    constructor(props: MenuProps);
    static defaultProps: {
        allowClear: boolean;
        createNewLabel: string;
        defaultValue: never[];
        multiple: boolean;
        searchPlaceholder: string;
        valueKey: string;
        valuePrefix: string;
        valueSuffix: string;
    };
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    static getLayoutDefinition(): LayoutDefinition;
    handleMenuClick: ({ key }: ClickParam) => void;
    handleButtonClick: (e: React.MouseEvent) => void;
    handleInputChange: ({ target }: React.ChangeEvent<HTMLInputElement>) => void;
    /****************************************************************
     * Define this component's render for Selectable to call
     * so Selectable can pass in Selectable state and props.
     * Props must implement SelectableChildProps interface.
     */
    private renderMenu;
    render(): JSX.Element;
}
//# sourceMappingURL=MenuInterfaceComponent.d.ts.map