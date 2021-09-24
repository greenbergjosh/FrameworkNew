import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
export interface UserInterfaceInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "user-interface";
    defaultDataValue?: any;
    defaultValue?: any[];
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    valueKey: string;
    submit: UserInterfaceProps["submit"];
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
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            label: string;
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    constructor(props: UserInterfaceInterfaceComponentProps);
    handleChangeData: (data: any) => void;
    handleChangeSchema: (schema: ComponentDefinition[]) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=UserInterfaceInterfaceComponent.d.ts.map