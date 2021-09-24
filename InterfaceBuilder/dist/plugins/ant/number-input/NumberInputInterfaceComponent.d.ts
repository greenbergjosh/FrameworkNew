import { InputNumberProps } from "antd/lib/input-number";
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
export interface NumberInputInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "number-input";
    defaultValue?: string | number;
    onChangeData: UserInterfaceProps["onChangeData"];
    placeholder: string;
    userInterfaceData: UserInterfaceProps["data"];
    valueKey: string;
    size: InputNumberProps["size"];
    max: InputNumberProps["max"];
    min: InputNumberProps["min"];
}
export declare class NumberInputInterfaceComponent extends BaseInterfaceComponent<NumberInputInterfaceComponentProps> {
    static defaultProps: {
        valueKey: string;
        defaultValue: string;
        placeholder: string;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => import("../../../globalTypes").ComponentDefinition[];
    constructor(props: NumberInputInterfaceComponentProps);
    handleChange: (value?: number | undefined) => void;
    private getNumberValue;
    render(): JSX.Element;
}
//# sourceMappingURL=NumberInputInterfaceComponent.d.ts.map