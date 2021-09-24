"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commonDateForm = [
    {
        key: "skeletonFormat",
        valueKey: "skeletonFormat",
        label: "Format",
        component: "select",
        defaultValue: "short",
        dataHandlerType: "local",
        data: {
            values: [
                {
                    label: "Short",
                    value: "short",
                    help: "Example: 11/4/16, 1:03 PM",
                },
                {
                    label: "Medium",
                    value: "medium",
                    help: "Example: Nov 4, 2016, 1:03:04 PM",
                },
                {
                    label: "Long",
                    value: "long",
                    help: "Example: November 4, 2016 at 1:03:04 PM GMT+5",
                },
                {
                    label: "Full",
                    value: "full",
                    help: "Example: Friday, November 4, 2016 at 1:03:04 PM GMT+05:30",
                },
                {
                    label: "Custom",
                    value: "custom",
                    help: "Set a custom  format",
                },
            ],
        },
    },
    {
        key: "customFormat",
        valueKey: "customFormat",
        label: "Custom Format",
        component: "input",
        defaultValue: "MM/dd/yyyy hh:mm:ss a",
        visibilityConditions: {
            "===": ["custom", { var: "skeletonFormat" }],
        },
    },
];
exports.tableDataTypes = [
    {
        option: {
            label: "Text",
            value: "string",
        },
        form: [],
    },
    {
        option: {
            label: "Number",
            value: "number",
        },
        form: [
            {
                key: "format",
                valueKey: "format",
                component: "select",
                label: "Format",
                defaultValue: "standard",
                dataHandlerType: "local",
                data: {
                    values: [
                        {
                            label: "Standard",
                            value: "standard",
                        },
                        {
                            label: "Currency",
                            value: "currency",
                        },
                        {
                            label: "Percentage",
                            value: "percentage",
                        },
                    ],
                },
            },
            {
                key: "precision",
                valueKey: "precision",
                label: "Precision",
                help: "Set the decimal precision of the number type",
                component: "number-input",
                defaultValue: 2,
            },
            {
                key: "negative",
                valueKey: "negative",
                component: "select",
                label: "Negative",
                defaultValue: "black",
                dataHandlerType: "local",
                data: {
                    values: [
                        {
                            label: "Black",
                            value: "black",
                        },
                    ],
                },
            },
        ],
    },
    {
        option: {
            label: "Date (Without Time)",
            value: "date",
        },
        form: commonDateForm,
    },
    {
        option: {
            label: "Date and Time",
            value: "dateTime",
        },
        form: commonDateForm,
    },
];
//# sourceMappingURL=table-data-types-form.js.map