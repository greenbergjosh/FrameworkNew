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
exports.numberRangeManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(numberRangeManageFormDefinition, extend));
};
var numberRangeManageFormDefinition = [
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
                                defaultValue: "Number Range",
                            },
                            {
                                key: "valueKey",
                                hidden: true,
                            },
                            {
                                key: "startKey",
                                valueKey: "startKey",
                                ordinal: 10,
                                component: "input",
                                defaultValue: "start",
                                label: "Start API Name",
                                help: "The name of the lower value field in the API endpoint.",
                            },
                            {
                                key: "endKey",
                                valueKey: "endKey",
                                ordinal: 11,
                                component: "input",
                                defaultValue: "end",
                                label: "End API Name",
                                help: "The name of the upper value field in the API endpoint.",
                            },
                            {
                                key: "lowerBound",
                                valueKey: "lowerBound",
                                ordinal: 12,
                                component: "number-input",
                                label: "Lower Bound",
                                help: "The minimum value of the range.",
                            },
                            {
                                key: "upperBound",
                                valueKey: "upperBound",
                                ordinal: 13,
                                component: "number-input",
                                label: "Upper Bound",
                                help: "The minimum value of the range.",
                            },
                            {
                                key: "defaultRangeValueType",
                                valueKey: "defaultRangeValueType",
                                ordinal: 15,
                                component: "select",
                                label: "Default Range Value",
                                help: "The initial value of the range",
                                defaultValue: "full",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        { label: "No Value", value: "none" },
                                        { label: "Full Range", value: "full" },
                                        { label: "Customize Default", value: "partial" },
                                    ],
                                },
                            },
                            {
                                key: "defaultRangeLowerValue",
                                valueKey: "defaultRangeLowerValue",
                                ordinal: 16,
                                component: "number-input",
                                label: "Default Lower Value",
                                help: "The default value of the lower value.",
                                visibilityConditions: {
                                    "===": [
                                        "partial",
                                        {
                                            var: ["defaultRangeValue"],
                                        },
                                    ],
                                },
                            },
                            {
                                key: "defaultRangeUpperValue",
                                valueKey: "defaultRangeUpperValue",
                                ordinal: 17,
                                component: "number-input",
                                label: "Default Upper Value",
                                help: "The default value of the upper value.",
                                visibilityConditions: {
                                    "===": [
                                        "partial",
                                        {
                                            var: ["defaultRangeValue"],
                                        },
                                    ],
                                },
                            },
                            {
                                key: "marks",
                                valueKey: "marks",
                                label: "Value Labels",
                                help: "Give custom labels to certain values",
                                component: "data-map",
                                defaultValue: [],
                                multiple: true,
                                keyComponent: {
                                    label: "Value",
                                    component: "number-input",
                                    valueKey: "value",
                                },
                                valueComponent: {
                                    label: "Label",
                                    component: "input",
                                    valueKey: "label",
                                },
                            },
                            {
                                key: "useWrapperObject",
                                valueKey: "useWrapperObject",
                                ordinal: 30,
                                component: "checkbox",
                                defaultValue: false,
                                label: "Use API Wrapper Object",
                                help: "Whether to send the start and end values as two separate values or contained in an object.",
                            },
                            {
                                key: "wrapperObjectKey",
                                valueKey: "wrapperObjectKey",
                                ordinal: 31,
                                component: "input",
                                defaultValue: "range",
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
                ],
            },
        ],
    },
];
//# sourceMappingURL=number-range-manage-form.js.map