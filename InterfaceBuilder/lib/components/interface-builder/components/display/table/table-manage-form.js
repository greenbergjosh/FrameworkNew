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
exports.tableManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(tableManageFormDefinition, extend));
};
var tableManageFormDefinition = [
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
                                defaultValue: "Table Config",
                            },
                            {
                                key: "hideLabel",
                                defaultValue: true,
                            },
                            {
                                key: "valueKey",
                                defaultValue: "columns",
                            },
                            {
                                key: "abstract",
                                valueKey: "abstract",
                                label: "Abstract Component",
                                component: "toggle",
                                defaultValue: false,
                                help: 'Marking this component as "Abstract" will force it to be configured in a descendant configuration',
                            },
                            {
                                key: "allowAdding",
                                valueKey: "allowAdding",
                                label: "Allow Add?",
                                help: "Allow the user to create new rows in the table",
                                component: "toggle",
                                defaultValue: false,
                                visibilityConditions: {
                                    "===": [
                                        false,
                                        {
                                            var: ["abstract"],
                                        },
                                    ],
                                },
                            },
                            {
                                key: "allowEditing",
                                valueKey: "allowEditing",
                                label: "Allow Edit?",
                                help: "Allow the user to edit rows in the table",
                                component: "toggle",
                                defaultValue: false,
                                visibilityConditions: {
                                    "===": [
                                        false,
                                        {
                                            var: ["abstract"],
                                        },
                                    ],
                                },
                            },
                            {
                                key: "allowDeleting",
                                valueKey: "allowDeleting",
                                label: "Allow Delete?",
                                help: "Allow the user to delete rows in the table",
                                component: "toggle",
                                defaultValue: false,
                                visibilityConditions: {
                                    "===": [
                                        false,
                                        {
                                            var: ["abstract"],
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
//# sourceMappingURL=table-manage-form.js.map