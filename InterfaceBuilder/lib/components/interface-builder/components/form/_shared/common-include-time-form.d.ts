export interface TimeSettings {
    includeTime: boolean;
    includeHour: boolean;
    includeMinute: boolean;
    includeSecond: boolean;
    use24Clock: boolean;
}
export declare const getTimeFormat: (timeSettings?: TimeSettings | undefined) => false | {
    format: string;
    use12Hours: boolean;
};
export declare const commonIncludeTimeForm: ({
    key: string;
    valueKey: string;
    ordinal: number;
    component: string;
    defaultValue: boolean;
    label: string;
    help: string;
    formColumnLayout?: undefined;
    orientation?: undefined;
    components?: undefined;
    visibilityConditions?: undefined;
} | {
    key: string;
    valueKey: string;
    component: string;
    formColumnLayout: {
        labelCol: {
            sm: {
                span: number;
            };
            md: {
                span: number;
            };
            lg: {
                span: number;
            };
            xl: {
                span: number;
            };
        };
        wrapperCol: {
            sm: {
                span: number;
            };
            md: {
                span: number;
            };
            lg: {
                span: number;
            };
            xl: {
                span: number;
            };
        };
    };
    orientation: string;
    components: {
        key: string;
        valueKey: string;
        showLabel: boolean;
        label: string;
        component: string;
        columns: {
            hideTitle: boolean;
            components: {
                key: string;
                valueKey: string;
                ordinal: number;
                component: string;
                defaultValue: boolean;
                label: string;
                help: string;
            }[];
        }[];
        visibilityConditions: {
            "===": (boolean | {
                var: string;
            })[];
        };
    }[];
    ordinal?: undefined;
    defaultValue?: undefined;
    label?: undefined;
    help?: undefined;
    visibilityConditions?: undefined;
} | {
    key: string;
    valueKey: string;
    ordinal: number;
    component: string;
    defaultValue: boolean;
    label: string;
    help: string;
    visibilityConditions: {
        "===": (boolean | {
            var: string;
        })[];
    };
    formColumnLayout?: undefined;
    orientation?: undefined;
    components?: undefined;
})[];
//# sourceMappingURL=common-include-time-form.d.ts.map