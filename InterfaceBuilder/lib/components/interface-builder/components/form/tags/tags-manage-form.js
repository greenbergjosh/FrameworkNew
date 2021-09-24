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
exports.selectManageFormDefinition = [
    {
        key: "base",
        components: [
            {
                key: "tabs",
                tabs: [
                    {
                        key: "data",
                        components: __spread(selectable_1.baseSelectDataComponents),
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "placeholder",
                                valueKey: "placeholder",
                                label: "Placeholder",
                                help: "The greyed out text to appear in the box when no item is selected",
                                component: "input",
                                defaultValue: null,
                            },
                            {
                                key: "allowClear",
                                valueKey: "allowClear",
                                label: "Allow Clear",
                                help: "Allow the user to clear the selection.",
                                component: "toggle",
                                defaultValue: true,
                            },
                        ]
                    }
                ],
            },
        ],
    },
];
exports.tagsManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(exports.selectManageFormDefinition, extend));
};
//# sourceMappingURL=tags-manage-form.js.map