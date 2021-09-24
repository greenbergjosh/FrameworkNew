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
var codec_1 = require("./codec");
exports.bulkTextInputManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(bulkTextInputManageFormDefinition, extend));
};
var bulkTextInputManageFormDefinition = [
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
                                defaultValue: "Text Area",
                            },
                            {
                                key: "valueKey",
                                defaultValue: "value",
                            },
                            {
                                key: "itemSeparator",
                                valueKey: "itemSeparator",
                                ordinal: 11,
                                component: "select",
                                label: "Item Separator",
                                dataHandlerType: "local",
                                defaultValue: codec_1.separator.newline,
                                data: {
                                    values: [
                                        {
                                            label: "New Line (each item is on a line by itself)",
                                            value: codec_1.separator.newline,
                                        },
                                        {
                                            label: 'Comma ("item1", "item2", etc)',
                                            value: codec_1.separator.comma,
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
                                key: "autosize",
                                valueKey: "autosize",
                                ordinal: 11,
                                component: "toggle",
                                defaultValue: true,
                                label: "Autosize height"
                            },
                            {
                                key: "newlinePlaceholder",
                                valueKey: "newlinePlaceholder",
                                ordinal: 11,
                                component: "input",
                                defaultValue: "Enter each item on a line by itself",
                                label: "Placeholder",
                                visibilityConditions: {
                                    "===": [codec_1.separator.newline, { var: "itemSeparator" }],
                                },
                            },
                            {
                                key: "commaPlaceholder",
                                valueKey: "commaPlaceholder",
                                ordinal: 11,
                                component: "input",
                                defaultValue: "Enter items separated by commas",
                                label: "Placeholder",
                                visibilityConditions: {
                                    "===": [codec_1.separator.comma, { var: "itemSeparator" }],
                                },
                            },
                            {
                                key: "minRows",
                                valueKey: "minRows",
                                ordinal: 12,
                                component: "number-input",
                                defaultValue: null,
                                label: "Min rows",
                                visibilityConditions: {
                                    "===": [false, { var: "autosize" }],
                                },
                            },
                            {
                                key: "maxRows",
                                valueKey: "maxRows",
                                ordinal: 13,
                                component: "number-input",
                                defaultValue: null,
                                label: "Max rows",
                                visibilityConditions: {
                                    "===": [false, { var: "autosize" }],
                                },
                            },
                        ]
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=bulk-text-input-manage-form.js.map