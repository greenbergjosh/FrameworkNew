export declare const tableDataTypes: ({
    option: {
        label: string;
        value: string;
    };
    form: ({
        key: string;
        valueKey: string;
        component: string;
        label: string;
        defaultValue: string;
        dataHandlerType: string;
        size: string;
        data: {
            values: {
                label: string;
                value: string;
            }[];
        };
        help?: undefined;
    } | {
        key: string;
        valueKey: string;
        label: string;
        help: string;
        component: string;
        defaultValue: number;
        size: string;
        dataHandlerType?: undefined;
        data?: undefined;
    })[];
} | {
    option: {
        label: string;
        value: string;
    };
    form: import("../../../..").ComponentDefinition[];
} | {
    option: {
        label: string;
        value: string;
    };
    form: ({
        hidden: boolean;
        maxLength: null;
        valueKey: string;
        label: string;
        hideLabel: boolean;
        component: string;
        defaultValue: string;
        size: string;
        keyComponent?: undefined;
        valueComponent?: undefined;
        multiple?: undefined;
        dashed?: undefined;
        orientation?: undefined;
        textAlignment?: undefined;
        text?: undefined;
        hideMenu?: undefined;
    } | {
        hideLabel: boolean;
        label: string;
        valueKey: string;
        hidden: boolean;
        component: string;
        size: string;
        keyComponent: {
            hideLabel: boolean;
            label: string;
            component: string;
            valueKey: string;
            size: string;
        };
        valueComponent: {
            hideLabel: boolean;
            label: string;
            component: string;
            valueKey: string;
            size: string;
        };
        multiple: boolean;
        maxLength?: undefined;
        defaultValue?: undefined;
        dashed?: undefined;
        orientation?: undefined;
        textAlignment?: undefined;
        text?: undefined;
        hideMenu?: undefined;
    } | {
        hidden: boolean;
        dashed: boolean;
        orientation: string;
        textAlignment: string;
        text: string;
        valueKey: string;
        label: string;
        hideLabel: boolean;
        component: string;
        maxLength?: undefined;
        defaultValue?: undefined;
        size?: undefined;
        keyComponent?: undefined;
        valueComponent?: undefined;
        multiple?: undefined;
        hideMenu?: undefined;
    } | {
        hideLabel: boolean;
        label: string;
        valueKey: string;
        component: string;
        hideMenu: boolean;
        hidden?: undefined;
        maxLength?: undefined;
        defaultValue?: undefined;
        size?: undefined;
        keyComponent?: undefined;
        valueComponent?: undefined;
        multiple?: undefined;
        dashed?: undefined;
        orientation?: undefined;
        textAlignment?: undefined;
        text?: undefined;
    })[];
})[];
//# sourceMappingURL=table-data-types-form.d.ts.map