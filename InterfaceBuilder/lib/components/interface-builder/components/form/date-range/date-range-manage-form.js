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
var common_include_time_form_1 = require("../_shared/common-include-time-form");
var base_component_form_1 = require("../../base/base-component-form");
exports.dateRangeManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(dateRangeManageFormDefinition, extend));
};
var dateRangeManageFormDefinition = [
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
                                defaultValue: "Date Range",
                            },
                            {
                                key: "valueKey",
                                hidden: true,
                            },
                            {
                                key: "defaultRangeValue",
                                valueKey: "defaultRangeValue",
                                ordinal: 0,
                                component: "select",
                                label: "Default Range Value",
                                help: "The initial value of the range",
                                defaultValue: "Today",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        { label: "Empty", value: "Empty" },
                                        { label: "Today", value: "Today" },
                                        { label: "Yesterday", value: "Yesterday" },
                                        { label: "This Week", value: "This Week" },
                                        { label: "Last Week", value: "Last Week" },
                                        { label: "This Month", value: "This Month" },
                                        { label: "Last Month", value: "Last Month" },
                                        { label: "YTD", value: "YTD" },
                                    ],
                                },
                            },
                            {
                                key: "startDateKey",
                                valueKey: "startDateKey",
                                ordinal: 10,
                                component: "input",
                                defaultValue: "startDate",
                                label: "Start Date API Name",
                                help: "The name of the start date field in the API endpoint.",
                            },
                            {
                                key: "endDateKey",
                                valueKey: "endDateKey",
                                ordinal: 11,
                                component: "input",
                                defaultValue: "endDate",
                                label: "End Date API Name",
                                help: "The name of the end date field in the API endpoint.",
                            },
                            {
                                key: "useWrapperObject",
                                valueKey: "useWrapperObject",
                                ordinal: 20,
                                component: "checkbox",
                                defaultValue: false,
                                label: "Use API Wrapper Object",
                                help: "Whether to send the start and end values as two separate values or contained in an object.",
                            },
                            {
                                key: "wrapperObjectKey",
                                valueKey: "wrapperObjectKey",
                                ordinal: 21,
                                component: "input",
                                defaultValue: "dateRange",
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
                        components: __spread(common_include_time_form_1.commonIncludeTimeForm)
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=date-range-manage-form.js.map