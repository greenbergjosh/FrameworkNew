import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...pivotTableManageFormDefinition, ...extend)
}

export const pivotTableManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Pivot Table Config",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
                hidden: true,
              },
              {
                key: "url",
                valueKey: "url",
                placeholder: "https://",
                label: "URL",
                component: "input",
                help: "Contains the cube URL for establishing the connection (online).",
                bindable: true,
              },
              {
                key: "catalog",
                valueKey: "catalog",
                placeholder: "Catalog Name",
                label: "Catalog",
                component: "input",
                help: "Contains the database name (catalog name) to fetch the data.",
                bindable: true,
              },
              {
                key: "cube",
                valueKey: "cube",
                placeholder: "Cube Name",
                label: "Cube",
                component: "input",
                help: "Points the respective cube name from OLAP database.",
                bindable: true,
              },
              {
                key: "providerType",
                valueKey: "providerType",
                label: "Provider Type",
                component: "radio",
                dataHandlerType: "local",
                hidden: false,
                hideLabel: false,
                invisible: false,
                size: "default",
                defaultValue: "SSAS",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Relational",
                      value: "Relational",
                    },
                    {
                      label: "SSAS",
                      value: "SSAS",
                    },
                  ],
                },
              },
              {
                key: "localeIdentifier",
                valueKey: "localeIdentifier",
                label: "Locale",
                component: "number-input",
                defaultValue: 1033,
                bindable: true,
              },
              {
                key: "enableSorting",
                valueKey: "enableSorting",
                label: "Sorting",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "showFieldList",
                valueKey: "showFieldList",
                label: "Show Field List",
                component: "toggle",
                help: "Provides a built-in Field List similar to Microsoft Excel.",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "showGroupingBar",
                valueKey: "showGroupingBar",
                label: "Show Grouping Bar",
                component: "toggle",
                help: "Allows dragging of OLAP cube elements between different axes such as rows, columns, values and filters, and change pivot view.",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "enableVirtualization",
                valueKey: "enableVirtualization",
                label: "Virtual Scrolling",
                component: "toggle",
                help: "Allows large amounts of data to be loaded without any performance degradation.",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "height",
                valueKey: "height",
                label: "Height",
                defaultValue: 350,
                help: "Height of the pivot table.",
                component: "number-input",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
