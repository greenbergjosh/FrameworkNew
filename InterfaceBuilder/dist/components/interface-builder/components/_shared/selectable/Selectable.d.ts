import React from "react";
import { JSONRecord } from "components/interface-builder/@types/JSONTypes";
import { UserInterfaceContext } from "../../../UserInterfaceContextManager";
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent";
import { SelectableOption, SelectableProps, SelectableState } from "./types";
export declare class Selectable extends BaseInterfaceComponent<SelectableProps, SelectableState> {
    static defaultProps: {
        createNewLabel: string;
        defaultValue: undefined;
        valueKey: string;
        valuePrefix: string;
        valueSuffix: string;
    };
    static contextType: React.Context<import("../../../UserInterfaceContextManager").UserInterfaceContextManager<any> | null>;
    context: React.ContextType<typeof UserInterfaceContext>;
    constructor(props: SelectableProps);
    static getDerivedStateFromProps(props: SelectableProps, state: SelectableState): {
        options: SelectableOption[];
        loadStatus: string;
    } | null;
    private static optionsDidChange;
    handleChange: (value: string | string[]) => void;
    /**
     *
     * @param values
     */
    updateOptionsFromValues: (values: JSONRecord[]) => void;
    /**
     *
     */
    getCleanValue: () => string | string[] | undefined;
    render(): JSX.Element;
}
//# sourceMappingURL=Selectable.d.ts.map