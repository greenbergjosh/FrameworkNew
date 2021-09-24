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
exports.dividerManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(dividerManageFormDefinition, extend));
};
var dividerManageFormDefinition = [
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
                                defaultValue: "",
                                hidden: true,
                            },
                            {
                                key: "hideLabel",
                                defaultValue: true,
                                hidden: true,
                            },
                            {
                                key: "valueKey",
                                defaultValue: "",
                                hidden: true,
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "text",
                                valueKey: "text",
                                component: "input",
                                defaultValue: "",
                                label: "Label",
                                help: "Text to appear on the divider itself",
                            },
                            {
                                key: "textAlignment",
                                valueKey: "textAlignment",
                                component: "select",
                                defaultValue: "center",
                                label: "Text Alignment",
                                help: "Whether the text on the label should appear on the left, right, or center of the divider.",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        {
                                            label: "Left",
                                            value: "left",
                                        },
                                        {
                                            label: "Center",
                                            value: "center",
                                        },
                                        {
                                            label: "Right",
                                            value: "right",
                                        },
                                    ],
                                },
                                visibilityConditions: {
                                    "!!": { var: "text" },
                                },
                            },
                            {
                                key: "orientation",
                                valueKey: "orientation",
                                component: "select",
                                defaultValue: "horizontal",
                                label: "Orientation",
                                help: "Whether the divider appears horizontally or vertically.",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        {
                                            label: "Horizontal",
                                            value: "horizontal",
                                        },
                                        {
                                            label: "Vertical",
                                            value: "vertical",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "dashed",
                                valueKey: "dashed",
                                component: "toggle",
                                defaultValue: false,
                                label: "Dashed",
                                help: "Instead of a solid line, the divider can appear as a dashed line.",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=divider-manage-form.js.map