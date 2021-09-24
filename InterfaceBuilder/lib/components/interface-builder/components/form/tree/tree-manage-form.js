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
exports.treeManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(treeManageFormDefinition, extend));
};
var treeManageFormDefinition = [
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
                                defaultValue: "Tree",
                            },
                            {
                                key: "valueKey",
                                defaultValue: "dataTree",
                            },
                            {
                                key: "modifiable",
                                valueKey: "modifiable",
                                label: "Modifiable?",
                                component: "toggle",
                                defaultValue: true,
                                help: "Is the user allowed to modify the tree in any way (Add, Edit, Rearrange)?",
                            },
                            {
                                key: "allowNestingInLeaves",
                                valueKey: "allowNestingInLeaves",
                                label: "Allow Nesting Leaves?",
                                component: "toggle",
                                defaultValue: true,
                                help: "Allows nesting a leaf under another leaf. If false, leaves and parents are considered separate types.",
                                visibilityConditions: {
                                    "===": [true, { var: "modifiable" }],
                                },
                            },
                            {
                                key: "allowAdd",
                                valueKey: "allowAdd",
                                label: "Allow add?",
                                component: "toggle",
                                defaultValue: true,
                                help: "Allow adding new items to the tree",
                                visibilityConditions: {
                                    and: [
                                        { "===": [true, { var: "modifiable" }] },
                                        { "===": [true, { var: "allowNestingInLeaves" }] },
                                    ],
                                },
                            },
                            {
                                key: "allowAddLeaves",
                                valueKey: "allowAddLeaves",
                                label: "Allow add leaves?",
                                component: "toggle",
                                defaultValue: true,
                                visibilityConditions: {
                                    and: [
                                        { "===": [true, { var: "modifiable" }] },
                                        { "===": [false, { var: "allowNestingInLeaves" }] },
                                    ],
                                },
                            },
                            {
                                key: "allowAddParents",
                                valueKey: "allowAddParents",
                                label: "Allow add parents?",
                                component: "toggle",
                                defaultValue: true,
                                visibilityConditions: {
                                    and: [
                                        { "===": [true, { var: "modifiable" }] },
                                        { "===": [false, { var: "allowNestingInLeaves" }] },
                                    ],
                                },
                            },
                            {
                                key: "selectable",
                                valueKey: "selectable",
                                label: "Selectable?",
                                component: "toggle",
                                defaultValue: true,
                                help: "Can the user select entries in the tree?",
                            },
                            {
                                key: "selectedKey",
                                valueKey: "selectedKey",
                                label: "Selected API Key",
                                component: "input",
                                defaultValue: "selected",
                                help: "The property that tracks the selection value",
                                visibilityConditions: {
                                    "===": [true, { var: "selectable" }],
                                },
                            },
                            {
                                key: "multiselect",
                                valueKey: "multiselect",
                                label: "Multi-Select?",
                                component: "toggle",
                                defaultValue: false,
                                help: "Can the user select multiple entries in the tree at the same time?",
                                visibilityConditions: {
                                    "===": [true, { var: "selectable" }],
                                },
                            },
                            {
                                key: "allowSelectParents",
                                valueKey: "allowSelectParents",
                                label: "Can select parents?",
                                component: "toggle",
                                defaultValue: false,
                                help: "Turn this on to allow the user to select both leaf nodes as well as parent nodes in the tree",
                                visibilityConditions: {
                                    "===": [true, { var: "selectable" }],
                                },
                            },
                        ],
                    },
                    {
                        key: "details",
                        component: "tab",
                        label: "Details",
                        components: [
                            {
                                key: "allowDetails",
                                valueKey: "allowDetails",
                                label: "Items have details?",
                                component: "toggle",
                                defaultValue: true,
                                help: "Whether there are details components / properties that should be shown about tree items",
                            },
                            {
                                key: "detailsOrientation",
                                valueKey: "detailsOrientation",
                                label: "Details location",
                                component: "select",
                                dataHandlerType: "local",
                                data: {
                                    values: [
                                        {
                                            label: "Left of the Tree",
                                            value: "left",
                                        },
                                        { label: "Right of the Tree", value: "right" },
                                        { label: "Below the Tree", value: "below" },
                                    ],
                                },
                                defaultValue: "right",
                                help: "Whether there are details components / properties that should be shown about tree items",
                            },
                        ],
                    },
                    {
                        key: "appearance",
                        components: [
                            {
                                key: "emptyText",
                                valueKey: "emptyText",
                                label: "Empty Text",
                                component: "input",
                                defaultValue: "No Items",
                                help: "Text to display when the tree is empty",
                            },
                            {
                                key: "addLabel",
                                valueKey: "addLabel",
                                label: "Add Button Text",
                                component: "input",
                                defaultValue: "Add Item",
                                help: "Allow adding new items to the tree",
                                visibilityConditions: {
                                    and: [
                                        { "===": [true, { var: "modifiable" }] },
                                        { "===": [true, { var: "allowNestingInLeaves" }] },
                                        { "===": [true, { var: "allowAdd" }] },
                                    ],
                                },
                            },
                            {
                                key: "addLeafLabel",
                                valueKey: "addLeafLabel",
                                label: "Add Leaf Button Text",
                                component: "input",
                                defaultValue: "Add Leaf",
                                help: "Allow adding new single items to the tree",
                                visibilityConditions: {
                                    and: [
                                        { "===": [true, { var: "modifiable" }] },
                                        { "===": [false, { var: "allowNestingInLeaves" }] },
                                        { "===": [true, { var: "allowAddLeaves" }] },
                                    ],
                                },
                            },
                            {
                                key: "addParentLabel",
                                valueKey: "addParentLabel",
                                label: "Add Parent Button Text",
                                component: "input",
                                defaultValue: "Add Parent",
                                help: "Allow adding new parents/groups to the tree",
                                visibilityConditions: {
                                    and: [
                                        { "===": [true, { var: "modifiable" }] },
                                        { "===": [false, { var: "allowNestingInLeaves" }] },
                                        { "===": [true, { var: "allowAddParents" }] },
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
//# sourceMappingURL=tree-manage-form.js.map