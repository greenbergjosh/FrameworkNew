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
exports.columnManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(columnManageFormDefinition, extend));
};
var columnManageFormDefinition = [
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
                                defaultValue: "Columns",
                            },
                            {
                                key: "hideLabel",
                                defaultValue: true,
                            },
                            {
                                key: "valueKey",
                                defaultValue: "columns",
                                hidden: true,
                            },
                            {
                                key: "columns",
                                valueKey: "columns",
                                component: "list",
                                orientation: "horizontal",
                                components: [
                                    {
                                        component: "form",
                                        label: "",
                                        hideLabel: true,
                                        components: [
                                            {
                                                key: "title",
                                                valueKey: "title",
                                                component: "input",
                                                label: "Title",
                                                visibilityConditions: {
                                                    "===": [false, { var: "hideTitle" }],
                                                },
                                            },
                                            {
                                                key: "hideTitle",
                                                valueKey: "hideTitle",
                                                component: "toggle",
                                                label: "Hide Title",
                                                defaultValue: false,
                                            },
                                            {
                                                key: "span",
                                                valueKey: "span",
                                                component: "number-input",
                                                label: "Column Width",
                                                help: "All column widths combined should add up to 24. Blank widths will be spread across any remaining space.",
                                            },
                                            {
                                                key: "components",
                                                valueKey: "components",
                                                component: "list",
                                                defaultValue: [],
                                                hidden: true,
                                            },
                                        ],
                                    },
                                ],
                                label: "Columns",
                                addItemLabel: "Add Column",
                                emptyText: "No Configured Columns",
                                help: "List how many here, and fill in the components in the Layout Creator",
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "gutter",
                                valueKey: "gutter",
                                component: "number-input",
                                label: "Gap between columns",
                                defaultValue: 8,
                                help: "Spacing (in pixels) between columns",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=column-manage-form.js.map