import React from "react";
import { ClickParam } from "antd/lib/menu";
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { SelectableProps } from "../../_shared/selectable/types";
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
    static manageForm: (...extend: (Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps> | Partial<import("../../base/BaseInterfaceComponent").ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => import("../../base/BaseInterfaceComponent").ComponentDefinition[];
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
        };
    };
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