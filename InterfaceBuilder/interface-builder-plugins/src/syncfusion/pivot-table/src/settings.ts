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
                defaultValue: "pivotTableSettings",
                hidden: true,
              },
              {
                key: "dataSourceSettings.url",
                valueKey: "dataSourceSettings.url",
                placeholder: "https://",
                label: "URL",
                component: "input",
                help: "Contains the cube URL for establishing the connection (online).",
                bindable: true,
              },
              {
                key: "dataSourceSettings.catalog",
                valueKey: "dataSourceSettings.catalog",
                placeholder: "Catalog Name",
                label: "Catalog",
                component: "input",
                help: "Contains the database name (catalog name) to fetch the data.",
                bindable: true,
              },
              {
                key: "dataSourceSettings.cube",
                valueKey: "dataSourceSettings.cube",
                placeholder: "Cube Name",
                label: "Cube",
                component: "input",
                help: "Points the respective cube name from OLAP database.",
                bindable: true,
              },
              {
                key: "dataSourceSettings.providerType",
                valueKey: "dataSourceSettings.providerType",
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
                key: "dataSourceSettings.localeIdentifier",
                valueKey: "dataSourceSettings.localeIdentifier",
                label: "Locale",
                component: "number-input",
                defaultValue: 1033,
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "dataSourceSettings.enableSorting",
                valueKey: "dataSourceSettings.enableSorting",
                label: "Sorting",
                component: "toggle",
                defaultValue: false,
                bindable: true,
                help: "Allows to perform sort operation to order members of a specific fields either in ascending or descending that used to be displayed in the pivot table.",
              },
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
                handlerFunctionSrc:
                  "return function({props, lib: { getValue, setValue, raiseEvent }, args}) {\n  // Do stuff here\n}",
                outgoingEventMap: {
                  valueChanged: {
                    type: "none",
                  },
                },
                style: "&.container {}",
                buttonStyle: "solid",
                buttonType: "radio",
                invisible: false,
                hidden: false,
                data: {
                  values: [
                    {
                      label: "Auto",
                      value: "auto",
                    },
                    {
                      label: "Match Field List height",
                      value: "fieldlist",
                    },
                    {
                      label: "Full",
                      value: "full",
                    },
                    {
                      label: "Value",
                      value: "value",
                    },
                  ],
                },
                dataHandlerType: "local",
                valueKey: "heightKey",
                label: "Height",
                hideLabel: false,
                component: "radio",
                defaultValue: "auto",
                name: "Height Options",
                help: "Height of the pivot table.",
              },
              {
                key: "height",
                valueKey: "height",
                label: "Height Value",
                defaultValue: 350,
                component: "number-input",
                bindable: true,
                visibilityConditions: {
                  "===": [
                    "value",
                    {
                      var: "heightKey",
                    },
                  ],
                },
              },
              {
                key: "exportExcel",
                valueKey: "exportExcel",
                label: "Export Excel",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "exportPDF",
                valueKey: "exportPDF",
                label: "Export PDF",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "exportCSV",
                valueKey: "exportCSV",
                label: "Export CSV",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
