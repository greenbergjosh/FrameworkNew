import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { StringTemplateInterfaceComponentProps, StringTemplateInterfaceComponentState } from "./types";
import { JSONRecord } from "../../../globalTypes/JSONTypes";
import { ComponentDefinition, LayoutDefinition } from "../../../globalTypes";
export declare class StringTemplateInterfaceComponent extends BaseInterfaceComponent<StringTemplateInterfaceComponentProps, StringTemplateInterfaceComponentState> {
    constructor(props: StringTemplateInterfaceComponentProps);
    static defaultProps: {
        userInterfaceData: {};
        valueKey: string;
        showBorder: boolean;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<import("../../../globalTypes").ComponentDefinitionNamedProps> | Partial<import("../../../globalTypes").ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<StringTemplateInterfaceComponentProps>, prevState: Readonly<StringTemplateInterfaceComponentState>): void;
    handleChangeFromSubcomponents: (changeData: JSONRecord) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=StringTemplateInterfaceComponent.d.ts.map