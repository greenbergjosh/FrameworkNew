import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent";
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes";
interface WizardStep {
    title: string;
    components: ComponentDefinition[];
}
declare enum EVENTS {
    nextClick = "nextClick",
    prevClick = "prevClick"
}
export interface IWizardInterfaceComponentProps extends ComponentDefinitionNamedProps {
    component: "wizard";
    steps: WizardStep[];
    defaultActiveStep?: number;
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    userInterfaceData?: UserInterfaceProps["data"];
    disableStepNumbersChangingTabs?: boolean;
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
        disableStepNumbersChangingTabs: boolean;
    };
    static getLayoutDefinition(): LayoutDefinition;
    static manageForm: (...extend: (Partial<ComponentDefinitionNamedProps> | Partial<ComponentDefinitionNamedProps & import("../../../globalTypes").ComponentDefinitionRecursiveProp>)[]) => ComponentDefinition[];
    static availableEvents: EVENTS[];
    state: {
        activeStep: number;
    };
    componentDidMount(): void;
    handleNextClick(activeStepIndex: number): () => void;
    handlePrevClick(activeStepIndex: number): () => void;
    handleChangeStep: (activeStepIndex: number) => (nextStepIndex: number) => void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=WizardInterfaceComponent.d.ts.map