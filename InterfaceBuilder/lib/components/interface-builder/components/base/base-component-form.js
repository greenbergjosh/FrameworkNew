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
var fp_1 = require("lodash/fp");
var mergeHandler = function (value, srcValue, key) {
    if (Array.isArray(value) && Array.isArray(srcValue)) {
        var _a = srcValue.reduce(function (acc, item) {
            var mergeableIndex = acc.remaining.findIndex(function (i) { return !!i.key && i.key === item.key; });
            if (mergeableIndex >= 0) {
                acc.items.push(fp_1.mergeWith(mergeHandler, acc.remaining[mergeableIndex], item));
                acc.remaining.splice(mergeableIndex, 1);
            }
            else {
                acc.items.push(item);
            }
            return acc;
        }, { items: [], remaining: __spread(value) }), items = _a.items, remaining = _a.remaining;
        // console.log("base-component-form.mergeHandler", "both array", {
        //   items,
        //   remaining,
        //   result: items.concat(remaining),
        // })
        return items.concat(remaining);
    }
    else {
        // console.log("base-component-form.mergeHandler", "non-array", { value, srcValue, key })
    }
};
exports.baseManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return extend.length
        ? mergeHandler(extend, baseManageFormDefinition)
        : baseManageFormDefinition;
};
var baseManageFormDefinition = [
    {
        key: "base",
        component: "form",
        components: [
            {
                key: "tabs",
                defaultActiveKey: "data",
                component: "tabs",
                tabs: [
                    {
                        key: "data",
                        component: "tab",
                        hideLabel: true,
                        label: "Data",
                        components: [
                            {
                                key: "hideLabel",
                                valueKey: "hideLabel",
                                ordinal: 0,
                                component: "toggle",
                                defaultValue: false,
                                label: "Hide Label",
                                help: "Whether or not to hide the label of this field.",
                            },
                            {
                                key: "label",
                                valueKey: "label",
                                ordinal: 0.1,
                                component: "input",
                                label: "Label",
                                visibilityConditions: {
                                    "!==": [
                                        true,
                                        {
                                            var: ["hideLabel"],
                                        },
                                    ],
                                },
                            },
                            {
                                key: "valueKey",
                                valueKey: "valueKey",
                                ordinal: 2,
                                component: "input",
                                label: "API Key",
                                help: "The API property name to use for this input component.",
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        component: "tab",
                        hideLabel: true,
                        label: "Appearance",
                        components: [],
                    },
                    {
                        key: "visibility",
                        component: "tab",
                        hideLabel: true,
                        label: "Visibility",
                        components: [
                            {
                                key: "hidden",
                                valueKey: "hidden",
                                ordinal: 10,
                                component: "toggle",
                                label: "Hidden",
                                defaultValue: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=base-component-form.js.map