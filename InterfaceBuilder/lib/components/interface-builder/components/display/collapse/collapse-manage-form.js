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
exports.collapseManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(collapseManageFormDefinition, extend));
};
var collapseManageFormDefinition = [
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
                                defaultValue: "Collapse",
                            },
                            {
                                key: "hideLabel",
                                defaultValue: true,
                            },
                            {
                                key: "valueKey",
                                defaultValue: "",
                                hidden: true,
                            },
                            {
                                key: "accordion",
                                valueKey: "accordion",
                                label: "Accordion",
                                help: "When accordion mode is active, only one section can be open at a time.",
                                component: "toggle",
                                defaultValue: true,
                            },
                            {
                                key: "sections",
                                valueKey: "sections",
                                component: "list",
                                components: [
                                    {
                                        component: "form",
                                        label: "",
                                        hideLabel: true,
                                        components: [
                                            {
                                                key: "title",
                                                valueKey: "title",
                                                hideLabel: true,
                                                component: "input",
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
                                label: "Collapse Sections",
                                addItemLabel: "Add Section",
                                emptyText: "No Configured Collapse Sections",
                                help: "List the named sections here, and fill in the components in the Layout Creator",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=collapse-manage-form.js.map