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
exports.timeRangeManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(timeRangeManageFormDefinition, extend));
};
var timeRangeManageFormDefinition = [
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
                                defaultValue: "Time Range",
                            },
                            {
                                key: "valueKey",
                                hidden: true,
                            },
                            {
                                key: "startTimeKey",
                                valueKey: "startTimeKey",
                                ordinal: 10,
                                component: "input",
                                defaultValue: "startTime",
                                label: "Start Time API Name",
                                help: "The name of the start time field in the API endpoint.",
                            },
                            {
                                key: "endTimeKey",
                                valueKey: "endTimeKey",
                                ordinal: 11,
                                component: "input",
                                defaultValue: "endTime",
                                label: "End Time API Name",
                                help: "The name of the end time field in the API endpoint.",
                            },
                            {
                                key: "useWrapperObject",
                                valueKey: "useWrapperObject",
                                ordinal: 12,
                                component: "checkbox",
                                defaultValue: false,
                                label: "Use API Wrapper Object",
                                help: "Whether to send the start and end values as two separate values or contained in an object.",
                            },
                            {
                                key: "wrapperObjectKey",
                                valueKey: "wrapperObjectKey",
                                ordinal: 13,
                                component: "input",
                                defaultValue: "timeRange",
                                label: "Wrapper Object API Name",
                                help: "The name of the wrapper object field in the API endpoint.",
                                visibilityConditions: {
                                    "===": [
                                        true,
                                        {
                                            var: ["useWrapperObject"],
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "size",
                                valueKey: "size",
                                component: "select",
                                label: "Size",
                                defaultValue: "default",
                                dataHandlerType: "local",
                                ordinal: 12,
                                data: {
                                    values: [
                                        {
                                            label: "Small",
                                            value: "small",
                                        },
                                        {
                                            label: "Medium (Default)",
                                            value: "default",
                                        },
                                        {
                                            label: "Large",
                                            value: "large",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "startTimePlaceholder",
                                valueKey: "startTimePlaceholder",
                                ordinal: 14,
                                component: "input",
                                defaultValue: "Start Time",
                                label: "Start Time Placeholder",
                            },
                            {
                                key: "endTimePlaceholder",
                                valueKey: "endTimePlaceholder",
                                ordinal: 15,
                                component: "input",
                                defaultValue: "End Time",
                                label: "End Time Placeholder",
                            },
                        ]
                    }
                ],
            },
        ],
    },
];
//# sourceMappingURL=time-range-manage-form.js.map