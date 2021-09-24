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
exports.downloadManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(buttonManageFormDefinition, extend));
};
var appearanceComponents = [
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
    __assign(__assign({}, icon_select_form_config_1.getIconSelectConfig(["download", "cloud-download"])), { ordinal: 13 }),
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
];
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
                                defaultValue: "Download File",
                            },
                            {
                                key: "valueKey",
                                hidden: true,
                            },
                            {
                                key: "url",
                                valueKey: "url",
                                label: "URL",
                                help: "",
                                component: "input",
                                defaultValue: "https://",
                            },
                            {
                                key: "httpMethod",
                                valueKey: "httpMethod",
                                component: "select",
                                label: "HTTP Method",
                                defaultValue: "GET",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        {
                                            label: "GET",
                                            value: "GET",
                                        },
                                        {
                                            label: "POST",
                                            value: "POST",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "paramsValueKey",
                                valueKey: "paramsValueKey",
                                label: "Params Value Key",
                                help: "",
                                component: "input",
                                defaultValue: "params",
                                visibilityConditions: {
                                    "===": ["POST", { var: ["httpMethod"] }],
                                },
                            },
                            {
                                key: "useFilenameFromServer",
                                valueKey: "useFilenameFromServer",
                                component: "toggle",
                                label: "Filename from server",
                                defaultValue: true,
                            },
                            {
                                key: "filename",
                                valueKey: "filename",
                                label: "Filename",
                                help: "",
                                component: "input",
                                defaultValue: "",
                                visibilityConditions: {
                                    "===": [false, { var: ["useFilenameFromServer"] }],
                                },
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        components: appearanceComponents
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=download-manage-form.js.map