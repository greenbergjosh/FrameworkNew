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
var selectable_1 = require("../../_shared/selectable");
exports.menuManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(exports.menuManageFormDefinition, extend));
};
exports.menuManageFormDefinition = [
    {
        key: "base",
        components: [
            {
                key: "tabs",
                tabs: [
                    {
                        key: "data",
                        components: __spread(selectable_1.baseSelectDataComponents, [
                            {
                                key: "resultLimit",
                                valueKey: "resultLimit",
                                label: "Result Limit",
                                ordinal: 9,
                                help: "Limit the number of results to display",
                                component: "number-input",
                                defaultValue: 15,
                            },
                        ]),
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "searchPlaceholder",
                                valueKey: "searchPlaceholder",
                                label: "Search Placeholder",
                                help: "The greyed out text to appear in the search field when no text is entered",
                                component: "input",
                                defaultValue: "Search...",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=menu-manage-form.js.map