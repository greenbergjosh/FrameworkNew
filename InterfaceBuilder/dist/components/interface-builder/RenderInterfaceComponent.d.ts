import React from "react";
import { UserInterfaceProps } from "./UserInterface";
import { BaseInterfaceComponent, ComponentDefinition } from "./components/base/BaseInterfaceComponent";
interface RenderInterfaceComponentProps {
    Component: typeof BaseInterfaceComponent;
    componentDefinition: ComponentDefinition;
    data: UserInterfaceProps["data"];
    getRootData: () => UserInterfaceProps["data"];
    dragDropDisabled?: boolean;
    index: number;
    mode: UserInterfaceProps["mode"];
    onChangeData: UserInterfaceProps["onChangeData"];
    onChangeSchema?: (newComponentDefinition: ComponentDefinition) => void;
    submit?: UserInterfaceProps["submit"];
    path: string;
}
interface RenderInterfaceComponentState {
    error: null | string;
}
export declare class RenderInterfaceComponent extends React.Component<RenderInterfaceComponentProps, RenderInterfaceComponentState> {
    state: {
        error: null;
    };
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    render(): JSX.Element | null;
}
export {};
//# sourceMappingURL=RenderInterfaceComponent.d.ts.map