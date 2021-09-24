/// <reference types="@welldone-software/why-did-you-render" />
import React from "react";
import { RenderInterfaceComponentProps, RenderInterfaceComponentState } from "../types";
export declare class RenderInterfaceComponent extends React.Component<RenderInterfaceComponentProps, RenderInterfaceComponentState> {
    state: {
        error: null;
    };
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    render(): JSX.Element | null;
}
//# sourceMappingURL=RenderInterfaceComponent.d.ts.map