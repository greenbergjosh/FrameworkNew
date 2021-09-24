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
exports.cardManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(cardManageFormDefinition, extend));
};
var cardManageFormDefinition = [
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
                                defaultValue: "Card",
                            },
                            {
                                key: "hideLabel",
                                defaultValue: true,
                            },
                            {
                                key: "valueKey",
                                defaultValue: "data",
                            },
                            {
                                key: "title",
                                valueKey: "title",
                                component: "input",
                                label: "Card Title",
                                defaultValue: "Card Title",
                            },
                            {
                                key: "extra",
                                valueKey: "extra",
                                component: "input",
                                label: "Detail Text",
                                defaultValue: "",
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "hoverable",
                                valueKey: "hoverable",
                                component: "toggle",
                                label: "Hover Effect",
                                defaultValue: true,
                            },
                            {
                                key: "bordered",
                                valueKey: "bordered",
                                component: "toggle",
                                label: "Show Border",
                                defaultValue: false,
                            },
                            {
                                key: "size",
                                valueKey: "size",
                                component: "select",
                                label: "Card Size",
                                defaultValue: "default",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        {
                                            label: "Standard",
                                            value: "default",
                                        },
                                        {
                                            label: "Small",
                                            value: "small",
                                        },
                                    ],
                                },
                            },
                            {
                                key: "inset",
                                valueKey: "inset",
                                component: "toggle",
                                label: "Show Inset",
                                defaultValue: false,
                            },
                        ]
                    }
                ],
            },
        ],
    },
];
//# sourceMappingURL=card-manage-form.js.map