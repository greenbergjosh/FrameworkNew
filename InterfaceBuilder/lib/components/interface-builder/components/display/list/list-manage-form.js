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
exports.listManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(listManageFormDefinition, extend));
};
var listManageFormDefinition = [
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
                                defaultValue: "Components",
                            },
                            {
                                key: "hideLabel",
                                defaultValue: true,
                            },
                            {
                                key: "valueKey",
                                defaultValue: "components",
                            },
                            {
                                key: "unwrapped",
                                valueKey: "unwrapped",
                                label: "Unwrapped?",
                                help: "Normally, a list contains JSON objects, but unwrapping allows the list to contain scalar values",
                                component: "toggle",
                                defaultValue: false,
                            },
                            {
                                key: "interleave",
                                valueKey: "interleave",
                                label: "Interleave",
                                help: "None - Single component repeated; Round Robin - Each component used in turn; Whole Set - Each component used every time.",
                                component: "select",
                                dataHandlerType: "local",
                                defaultValue: "none",
                                data: {
                                    values: [
                                        {
                                            label: "None",
                                            value: "none",
                                        },
                                        {
                                            label: "Round Robin",
                                            value: "round-robin",
                                        },
                                        {
                                            label: "Whole Set",
                                            value: "set",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "addItemLabel",
                                valueKey: "addItemLabel",
                                component: "input",
                                defaultValue: "Add Item",
                                label: "'Add' Button Text",
                            },
                            {
                                key: "emptyText",
                                valueKey: "emptyText",
                                component: "input",
                                defaultValue: "No Items",
                                label: "Empty Text",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=list-manage-form.js.map