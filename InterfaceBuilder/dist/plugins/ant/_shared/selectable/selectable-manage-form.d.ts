export declare const baseSelectDataComponents: ({
    key: string;
    defaultValue: string;
    bindable: boolean;
    valueKey?: undefined;
    label?: undefined;
    component?: undefined;
    ordinal?: undefined;
    help?: undefined;
    dataHandlerType?: undefined;
    data?: undefined;
    hidden?: undefined;
    multiple?: undefined;
    keyComponent?: undefined;
    valueComponent?: undefined;
    visibilityConditions?: undefined;
} | {
    key: string;
    valueKey: string;
    label: string;
    component: string;
    bindable: boolean;
    defaultValue?: undefined;
    ordinal?: undefined;
    help?: undefined;
    dataHandlerType?: undefined;
    data?: undefined;
    hidden?: undefined;
    multiple?: undefined;
    keyComponent?: undefined;
    valueComponent?: undefined;
    visibilityConditions?: undefined;
} | {
    key: string;
    valueKey: string;
    label: string;
    ordinal: number;
    component: string;
    help: string;
    dataHandlerType: string;
    bindable: boolean;
    data: {
        values: {
            label: string;
            value: string;
        }[];
    };
    defaultValue: string;
    hidden: boolean;
    multiple?: undefined;
    keyComponent?: undefined;
    valueComponent?: undefined;
    visibilityConditions?: undefined;
} | {
    key: string;
    valueKey: string;
    label: string;
    component: string;
    defaultValue: never[];
    multiple: boolean;
    bindable: boolean;
    keyComponent: {
        label: string;
        component: string;
        valueKey: string;
    };
    valueComponent: {
        label: string;
        component: string;
        valueKey: string;
    };
    visibilityConditions: {
        "===": (string | {
            var: string[];
        })[];
    };
    ordinal?: undefined;
    help?: undefined;
    dataHandlerType?: undefined;
    data?: undefined;
    hidden?: undefined;
})[];
//# sourceMappingURL=selectable-manage-form.d.ts.map