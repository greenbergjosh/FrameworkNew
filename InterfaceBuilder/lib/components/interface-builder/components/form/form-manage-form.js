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
var base_component_form_1 = require("../base/base-component-form");
exports.formManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(formManageFormDefinition, extend));
};
var formManageFormDefinition = [
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
                                defaultValue: "Form",
                            },
                            {
                                key: "valueKey",
                                hidden: true,
                            },
                            {
                                key: "orientation",
                                valueKey: "orientation",
                                label: "Orientation",
                                component: "select",
                                dataHandlerType: "local",
                                defaultValue: "vertical",
                                data: {
                                    values: [
                                        {
                                            label: "Vertical",
                                            value: "vertical",
                                        },
                                        {
                                            label: "Horizontal",
                                            value: "horizontal",
                                        },
                                        {
                                            label: "Inline",
                                            value: "inline",
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
//# sourceMappingURL=form-manage-form.js.map