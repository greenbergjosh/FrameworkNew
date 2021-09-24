import { UserInterfaceProps } from "../../../UserInterface";
import { BaseInterfaceComponent, ComponentDefinitionNamedProps, ComponentDefinition } from "../../base/BaseInterfaceComponent";
interface WizardStep {
    title: string;
    components: ComponentDefinition[];
}
export interface IWizardInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "wizard";
    steps: WizardStep[];
    defaultActiveStep?: number;
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData?: UserInterfaceProps["data"];
}
interface WizardInterfaceComponentDisplayModeProps extends IWizardInterfaceComponentProps {
    mode: "display";
}
interface WizardInterfaceComponentEditModeProps extends IWizardInterfaceComponentProps {
    mode: "edit";
    onChangeSchema?: (newSchema: ComponentDefinition) => void;
    userInterfaceSchema?: ComponentDefinition;
}
declare type WizardInterfaceComponentProps = WizardInterfaceComponentDisplayModeProps | WizardInterfaceComponentEditModeProps;
export interface WizardInterfaceComponentState {
    activeStep: number;
}
export declare class WizardInterfaceComponent extends BaseInterfaceComponent<WizardInterfaceComponentProps, WizardInterfaceComponentState> {
    static defaultProps: {
        steps: never[];
    };
    static getLayoutDefinition(): {
        category: string;
        name: string;
        title: string;
        icon: string;
        componentDefinition: {
            component: string;
            steps: never[];
        };
    };
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../base/BaseInterfaceComponent").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    state: {
        activeStep: number;
    };
    componentDidMount(): void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=WizardInterfaceComponent.d.ts.map