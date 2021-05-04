import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const treeManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...treeManageFormDefinition, ...extend)
}

const treeManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "dataTree",
                bindable: true,
              },
              {
                key: "modifiable",
                valueKey: "modifiable",
                label: "Modifiable?",
                component: "toggle",
                defaultValue: true,
                help: "Is the user allowed to modify the tree in any way (Add, Edit, Rearrange)?",
                bindable: true,
              },
              {
                key: "allowNestingInLeaves",
                valueKey: "allowNestingInLeaves",
                label: "Allow Nesting Leaves?",
                component: "toggle",
                defaultValue: true,
                help:
                  "Allows nesting a leaf under another leaf. If false, leaves and parents are considered separate types.",
                bindable: true,
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
                bindable: true,
                visibilityConditions: {
                  and: [{ "===": [true, { var: "modifiable" }] }, { "===": [true, { var: "allowNestingInLeaves" }] }],
                },
              },
              {
                key: "allowAddLeaves",
                valueKey: "allowAddLeaves",
                label: "Allow add leaves?",
                component: "toggle",
                defaultValue: true,
                bindable: true,
                visibilityConditions: {
                  and: [{ "===": [true, { var: "modifiable" }] }, { "===": [false, { var: "allowNestingInLeaves" }] }],
                },
              },
              {
                key: "allowAddParents",
                valueKey: "allowAddParents",
                label: "Allow add parents?",
                component: "toggle",
                defaultValue: true,
                bindable: true,
                visibilityConditions: {
                  and: [{ "===": [true, { var: "modifiable" }] }, { "===": [false, { var: "allowNestingInLeaves" }] }],
                },
              },
              {
                key: "selectable",
                valueKey: "selectable",
                label: "Selectable?",
                component: "toggle",
                defaultValue: true,
                help: "Can the user select entries in the tree?",
                bindable: true,
              },
              {
                key: "selectedKey",
                valueKey: "selectedKey",
                label: "Selected API Key",
                component: "input",
                defaultValue: "selected",
                help: "The property that tracks the selection value",
                bindable: true,
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
                bindable: true,
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
                bindable: true,
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
                bindable: true,
              },
              {
                key: "detailsOrientation",
                valueKey: "detailsOrientation",
                label: "Details location",
                component: "select",
                dataHandlerType: "local",
                bindable: true,
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
                bindable: true,
              },
              {
                key: "addLabel",
                valueKey: "addLabel",
                label: "Add Button Text",
                component: "input",
                defaultValue: "Add Item",
                help: "Allow adding new items to the tree",
                bindable: true,
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
                bindable: true,
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
                bindable: true,
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
]
