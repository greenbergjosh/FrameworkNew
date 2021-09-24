import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface UserInterfaceInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "user-interface";
    defaultDataValue?: any;
    defaultValue?: any[];
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    submit: UserInterfaceProps["submit"];
    hideMenu: boolean;
}
interface UserInterfaceInterfaceComponentState {
    data: any;
}
export declare class UserInterfaceInterfaceComponent extends BaseInterfaceComponent<UserInterfaceInterfaceComponentProps, UserInterfaceInterfaceComponentState> {
    static defaultProps: {
        defaultDataValue: {};
        defaultValue: never[];
        mode: string;
        valueKey: string;
        hideMenu: boolean;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    constructor(props: UserInterfaceInterfaceComponentProps);
    handleChangeData: (data: any) => void;
    handleChangeSchema: (schema: ComponentDefinition[]) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=UserInterfaceInterfaceComponent.d.ts.map