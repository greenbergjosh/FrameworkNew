"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_component_form_1 = require("../../base/base-component-form");
exports.progressManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(progressManageFormDefinition, extend));
};
var progressManageFormDefinition = [
    {
        key: "base",
        components: [
            {
                key: "tabs",
                tabs: [
                    {
                        key: "data",
                        components: [
                            {
                                key: "label",
                                defaultValue: "Progress",
                            },
                            {
                                key: "hideLabel",
                                defaultValue: true,
                            },
                            {
                                key: "valueKey",
                                defaultValue: "data",
                            },
                            {
                                key: "calculatePercent",
                                valueKey: "calculatePercent",
                                component: "toggle",
                                defaultValue: false,
                                label: "Calculate Percent",
                                help: "Calculate the percent from the current count and a maximum value. When not selected, the data is assumed to be a percentage.",
                            },
                            {
                                key: "maxValueKey",
                                valueKey: "maxValueKey",
                                component: "input",
                                defaultValue: "maxValue",
                                label: "Max Value API Key",
                                help: "The API property name to use for the Progress component's maximum value.",
                                visibilityConditions: {
                                    "===": [true, { var: "calculatePercent" }],
                                },
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "forceStatus",
                                valueKey: "forceStatus",
                                component: "select",
                                defaultValue: "normal",
                                label: "Status",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        {
                                            label: "Normal",
                                            value: "normal",
                                        },
                                        {
                                            label: "Active",
                                            value: "active",
                                        },
                                        {
                                            label: "Success",
                                            value: "success",
                                        },
                                        {
                                            label: "Exception",
                                            value: "exception",
                                        },
                                        {
                                            label: "Read from API",
                                            value: "useAPI",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "statusGroup",
                                valueKey: "statusGroup",
                                label: "Status Options",
                                component: "card",
                                components: [
                                    {
                                        key: "statusKey",
                                        valueKey: "statusKey",
                                        component: "input",
                                        defaultValue: "status",
                                        label: "API Key for Status",
                                        help: "The API property name to use for the Progress component status.",
                                    },
                                    {
                                        key: "statuses.normal",
                                        valueKey: "statuses.normal",
                                        component: "input",
                                        defaultValue: "normal",
                                        label: "Normal Value",
                                    },
                                    {
                                        key: "statuses.active",
                                        valueKey: "statuses.active",
                                        component: "input",
                                        defaultValue: "active",
                                        label: "Active Value",
                                    },
                                    {
                                        key: "statuses.success",
                                        valueKey: "statuses.success",
                                        component: "input",
                                        defaultValue: "success",
                                        label: "Success Value",
                                    },
                                    {
                                        key: "statuses.exception",
                                        valueKey: "statuses.exception",
                                        component: "input",
                                        defaultValue: "exception",
                                        label: "Exception Value",
                                    },
                                ],
                                visibilityConditions: {
                                    "===": ["useAPI", { var: "forceStatus" }],
                                },
                            },
                            {
                                key: "type",
                                valueKey: "type",
                                component: "select",
                                label: "Progress Type",
                                defaultValue: "line",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        {
                                            label: "Line",
                                            value: "line",
                                        },
                                        {
                                            label: "Circle",
                                            value: "circle",
                                        },
                                        {
                                            label: "Gauge",
                                            value: "dashboard",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "smallLine",
                                valueKey: "smallLine",
                                component: "toggle",
                                label: "Small Line",
                                defaultValue: false,
                                dataHandlerType: "local",
                                visibilityConditions: {
                                    "===": ["line", { var: "type" }],
                                },
                            },
                            {
                                key: "width",
                                valueKey: "width",
                                component: "number-input",
                                label: "Width",
                                dataHandlerType: "local",
                                visibilityConditions: {
                                    "!==": ["line", { var: "type" }],
                                },
                            },
                            {
                                key: "hideInfo",
                                valueKey: "hideInfo",
                                component: "toggle",
                                label: "Hide Info",
                                defaultValue: false,
                                help: "Hide progress summary information",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=progress-manage-form.js.map