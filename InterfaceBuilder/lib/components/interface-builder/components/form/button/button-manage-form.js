"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var icon_select_form_config_1 = require("../_shared/icon-select-form-config");
var base_component_form_1 = require("../../base/base-component-form");
exports.buttonManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(buttonManageFormDefinition, extend));
};
var actionTab = {
    key: "action",
    component: "tab",
    hideLabel: true,
    label: "Action",
    components: [
        {
            key: "requireConfirmation",
            valueKey: "requireConfirmation",
            ordinal: 5,
            component: "toggle",
            defaultValue: false,
            label: "Require Confirmation",
            help: "Requires the user to confirm this action before it will be executed.",
        },
        {
            key: "confirmation.title",
            valueKey: "confirmation.title",
            ordinal: 10,
            component: "input",
            defaultValue: "Are you sure?",
            label: "Confirmation Title",
            visibilityConditions: {
                "===": [true, { var: "requireConfirmation" }],
            },
        },
        {
            key: "confirmation.message",
            valueKey: "confirmation.message",
            ordinal: 12,
            component: "input",
            defaultValue: "This action cannot be undone and may take a while. Are you sure?",
            label: "Confirmation Message",
            visibilityConditions: {
                "===": [true, { var: "requireConfirmation" }],
            },
        },
        {
            key: "confirmation.okText",
            valueKey: "confirmation.okText",
            ordinal: 14,
            component: "input",
            defaultValue: "Continue",
            label: "OK Option Text",
            visibilityConditions: {
                "===": [true, { var: "requireConfirmation" }],
            },
        },
        {
            key: "confirmation.cancelText",
            valueKey: "confirmation.cancelText",
            ordinal: 16,
            component: "input",
            defaultValue: "Cancel",
            label: "Cancel Option Text",
            visibilityConditions: {
                "===": [true, { var: "requireConfirmation" }],
            },
        },
        {
            key: "action.type",
            valueKey: "action.type",
            ordinal: 20,
            component: "select",
            label: "Remote Action Type",
            dataHandlerType: "local",
            data: {
                values: [
                    {
                        label: "LBM",
                        value: "lbm",
                    },
                    {
                        label: "Stored Proc",
                        value: "proc",
                    },
                ],
            },
        },
        {
            key: "action.lbm",
            valueKey: "action.lbm",
            ordinal: 22,
            component: "select",
            label: "Remote Action Method",
            dataHandlerType: "remote-config",
            remoteConfigType: "LBM.CS",
            visibilityConditions: {
                "===": ["lbm", { var: "action.type" }],
            },
        },
        {
            key: "action.proc",
            valueKey: "action.proc",
            ordinal: 22,
            component: "select",
            label: "Remote Procedure",
            dataHandlerType: "remote-config",
            remoteConfigType: "Report.Query",
            visibilityConditions: {
                "===": ["proc", { var: "action.type" }],
            },
        },
    ],
};
var appearanceTab = {
    key: "appearance",
    components: [
        {
            key: "displayType",
            valueKey: "displayType",
            component: "select",
            label: "Type",
            defaultValue: null,
            dataHandlerType: "local",
            ordinal: 11,
            data: {
                values: [
                    {
                        label: "Default",
                        value: null,
                    },
                    {
                        label: "Primary",
                        value: "primary",
                    },
                    {
                        label: "Ghost",
                        value: "ghost",
                    },
                    {
                        label: "Dashed",
                        value: "dashed",
                    },
                    {
                        label: "Danger",
                        value: "danger",
                    },
                    {
                        label: "Link",
                        value: "link",
                    },
                ],
            },
        },
        {
            key: "shape",
            valueKey: "shape",
            component: "select",
            label: "Shape",
            defaultValue: null,
            dataHandlerType: "local",
            ordinal: 12,
            data: {
                values: [
                    {
                        label: "Rectangle",
                        value: null,
                    },
                    {
                        label: "Rounded Rectangle",
                        value: "round",
                    },
                    {
                        label: "Circle",
                        value: "circle",
                    },
                    {
                        label: "Circle Outline",
                        value: "circle-outline",
                    },
                ],
            },
            visibilityConditions: {
                "!==": ["link", { var: ["displayType"] }],
            },
        },
        __assign(__assign({}, icon_select_form_config_1.getIconSelectConfig()), { ordinal: 13 }),
        {
            key: "hideButtonLabel",
            valueKey: "hideButtonLabel",
            ordinal: 14,
            component: "toggle",
            defaultValue: false,
            label: "Hide Button Text",
            visibilityConditions: {
                and: [
                    { "!==": ["circle", { var: ["shape"] }] },
                    { "!==": ["circle-outline", { var: ["shape"] }] },
                ],
            },
        },
        {
            key: "buttonLabel",
            valueKey: "buttonLabel",
            ordinal: 15,
            component: "input",
            defaultValue: "Button",
            label: "Button Text",
        },
        {
            key: "size",
            valueKey: "size",
            component: "select",
            label: "Size",
            defaultValue: null,
            dataHandlerType: "local",
            ordinal: 16,
            data: {
                values: [
                    {
                        label: "Small",
                        value: "small",
                    },
                    {
                        label: "Medium (Default)",
                        value: null,
                    },
                    {
                        label: "Large",
                        value: "large",
                    },
                ],
            },
        },
        {
            key: "block",
            valueKey: "block",
            ordinal: 17,
            component: "toggle",
            defaultValue: false,
            label: "Full Width",
            visibilityConditions: {
                and: [
                    { "!==": ["circle", { var: ["shape"] }] },
                    { "!==": ["circle-outline", { var: ["shape"] }] },
                ],
            },
        },
        {
            key: "ghost",
            valueKey: "ghost",
            ordinal: 18,
            component: "toggle",
            defaultValue: false,
            label: "Contrast",
            help: "Increase contrast when placed over a dark background",
        },
    ],
};
var buttonManageFormDefinition = [
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
                                defaultValue: "Take Action",
                            },
                            {
                                key: "valueKey",
                                hidden: true,
                            },
                        ],
                    },
                    appearanceTab,
                    actionTab,
                ],
            },
        ],
    },
];
//# sourceMappingURL=button-manage-form.js.map