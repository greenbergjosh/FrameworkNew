import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinition, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent";
interface ColumnModelColumnInterfaceComponent {
    title?: string;
    hideTitle?: boolean;
    components: ComponentDefinition[];
    span?: number;
}
export interface ColumnInterfaceComponentProps extends ComponentDefinitionNamedProps {
    columns: ColumnModelColumnInterfaceComponent[];
    component: "column";
    gutter?: number;
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData?: UserInterfaceProps["data"];
    getRootUserInterfaceData: () => UserInterfaceProps["data"];
    valueKey: string;
    submit?: UserInterfaceProps["submit"];
}
export declare class ColumnInterfaceComponent extends BaseInterfaceComponent<ColumnInterfaceComponentProps> {
    static defaultProps: {
        addItemLabel: string;
        columns: never[];
        gutter: number;
        userInterfaceData: {};
        valueKey: string;
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            components: never[];
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    static getDefinitionDefaultValue({ columns }: ColumnInterfaceComponentProps): {};
    getDefaultValue: () => {};
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=ColumnInterfaceComponent.d.ts.map