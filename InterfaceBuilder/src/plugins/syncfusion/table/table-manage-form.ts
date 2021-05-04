import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const tableManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...tableManageFormDefinition, ...extend)
}

export const tableManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "columns",
                bindable: true,
              },
              {
                key: "abstract",
                valueKey: "abstract",
                label: "Abstract Component",
                component: "toggle",
                defaultValue: false,
                help:
                  'Marking this component as "Abstract" will force it to be configured in a descendant configuration',
                bindable: true,
              },
              {
                key: "allowAdding",
                valueKey: "allowAdding",
                label: "Allow Add?",
                help: "Allow the user to create new rows in the table",
                component: "toggle",
                defaultValue: false,
                bindable: true,
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
                bindable: true,
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
                bindable: true,
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
                key: "loadingKey",
                valueKey: "loadingKey",
                component: "input",
                defaultValue: "loading",
                label: "Loading Key",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "showToolbar",
                valueKey: "showToolbar",
                label: "Show Toolbar",
                component: "toggle",
                defaultValue: true,
                help: "Make the top toolbar visible.",
                bindable: true,
              },
              {
                key: "defaultCollapseAll",
                valueKey: "defaultCollapseAll",
                label: "Default Collapse Groups",
                component: "toggle",
                defaultValue: false,
                help: "Start with all groups collapsed.",
                bindable: true,
              },
              {
                key: "autoFitColumns",
                valueKey: "autoFitColumns",
                label: "Auto Fit Columns",
                component: "toggle",
                defaultValue: false,
                help:
                  "Automatically adjusts column widths to fit the data. When disabled, the available width is distributed evenly across all columns.",
                bindable: true,
              },
              {
                key: "useSmallFont",
                valueKey: "useSmallFont",
                label: "Small Font Size",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "useSmallPager",
                valueKey: "useSmallPager",
                label: "Small Pager",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "enableAltRow",
                valueKey: "enableAltRow",
                label: "Enable Alt Row Color",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "enableVirtualization",
                valueKey: "enableVirtualization",
                label: "Enable Virtualization",
                component: "toggle",
                defaultValue: false,
                help: "Load and render rows as they scroll into view to improve performance in some cases.",
                bindable: true,
              },
              {
                key: "height",
                valueKey: "height",
                label: "Table Height",
                component: "number-input",
                help: "A table height is required when Enable Virtualization is enabled.",
                bindable: true,
                visibilityConditions: {
                  "===": [
                    true,
                    {
                      var: ["enableVirtualization"],
                    },
                  ],
                },
              },
              {
                key: "defaultPageSize",
                valueKey: "defaultPageSize",
                component: "select",
                label: "Default Page Size",
                defaultValue: "50",
                dataHandlerType: "local",
                help: "Default number of rows to show per page.",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "All",
                      value: "All",
                    },
                    {
                      label: "25",
                      value: "25",
                    },
                    {
                      label: "50",
                      value: "50",
                    },
                    {
                      label: "100",
                      value: "100",
                    },
                    {
                      label: "150",
                      value: "150",
                    },
                    {
                      label: "200",
                      value: "200",
                    },
                    {
                      label: "500",
                      value: "500",
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
]
