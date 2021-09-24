"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeFormat = function (timeSettings) {
    if (timeSettings && timeSettings.includeTime) {
        var includeHour = timeSettings.includeHour, includeMinute = timeSettings.includeMinute, includeSecond = timeSettings.includeSecond, use24Clock = timeSettings.use24Clock;
        var formatString = "";
        if (includeHour) {
            formatString += (formatString.length ? ":" : "") + (use24Clock ? "HH" : "h");
        }
        if (includeMinute) {
            formatString += (formatString.length ? ":" : "") + "mm";
        }
        if (includeSecond) {
            formatString += (formatString.length ? ":" : "") + "ss";
        }
        if (!use24Clock) {
            formatString += (formatString.length ? " " : "") + "A";
        }
        if (formatString) {
            return { format: formatString, use12Hours: !use24Clock };
        }
    }
    return false;
};
exports.commonIncludeTimeForm = [
    {
        key: "timeSettings.includeTime",
        valueKey: "timeSettings.includeTime",
        ordinal: 12,
        component: "toggle",
        defaultValue: false,
        label: "Include Time Picker?",
        help: "Indicates whether to allow picking time in the ranges as well as date.",
    },
    {
        key: "timeSettingsColumnsWrapper",
        valueKey: "timeSettingsColumnsWrapper",
        component: "form",
        formColumnLayout: {
            labelCol: {
                sm: { span: 24 },
                md: { span: 16 },
                lg: { span: 18 },
                xl: { span: 19 },
            },
            wrapperCol: {
                sm: { span: 24 },
                md: { span: 8 },
                lg: { span: 6 },
                xl: { span: 5 },
            },
        },
        orientation: "vertical",
        components: [
            {
                key: "timeSettingsColumns",
                valueKey: "timeSettingsColumns",
                showLabel: false,
                label: "",
                component: "column",
                columns: [
                    {
                        hideTitle: true,
                        components: [
                            {
                                key: "timeSettings.includeHour",
                                valueKey: "timeSettings.includeHour",
                                ordinal: 13,
                                component: "toggle",
                                defaultValue: false,
                                label: "Allow Choosing Hour?",
                                help: "Along with the date, is the user allowed to pick an hour?",
                            },
                        ],
                    },
                    {
                        hideTitle: true,
                        components: [
                            {
                                key: "timeSettings.includeMinute",
                                valueKey: "timeSettings.includeMinute",
                                ordinal: 14,
                                component: "toggle",
                                defaultValue: false,
                                label: "Allow Choosing Minute?",
                                help: "Along with the date, is the user allowed to pick a minute?",
                            },
                        ],
                    },
                    {
                        hideTitle: true,
                        components: [
                            {
                                key: "timeSettings.includeSecond",
                                valueKey: "timeSettings.includeSecond",
                                ordinal: 15,
                                component: "toggle",
                                defaultValue: false,
                                label: "Allow Choosing Second?",
                                help: "Along with the date, is the user allowed to pick a second?",
                            },
                        ],
                    },
                ],
                visibilityConditions: {
                    "===": [true, { var: "timeSettings.includeTime" }],
                },
            },
        ],
    },
    {
        key: "timeSettings.use24Clock",
        valueKey: "timeSettings.use24Clock",
        ordinal: 16,
        component: "toggle",
        defaultValue: false,
        label: "Use 24 Hour Clock?",
        help: "Turn this on to remove AM/PM and use hours from 00 to 23. ",
        visibilityConditions: {
            "===": [true, { var: "timeSettings.includeTime" }],
        },
    },
];
//# sourceMappingURL=common-include-time-form.js.map