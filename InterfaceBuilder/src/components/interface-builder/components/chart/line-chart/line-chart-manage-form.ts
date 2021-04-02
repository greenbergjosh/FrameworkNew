import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { nivoColorConfigOptions } from "../_shared/colors"

export const lineChartManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...LineChartManageFormDefinition, ...extend)
}

export const LineChartManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Line Chart",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
              {
                key: "useTooltipFunction",
                valueKey: "useTooltipFunction",
                component: "toggle",
                label: "Tooltip Custom Formatter",
                help:
                  "A function that receives the data point and returns a formatted string displayed as the tooltip of the data point.",
                bindable: true,
              },
              {
                key: "tooltipFunctionSrc",
                valueKey: "tooltipFunctionSrc",
                defaultTheme: "vs-dark",
                defaultLanguage: "javascript",
                component: "code-editor",
                height: 100,
                bindable: true,
                visibilityConditions: {
                  "===": [
                    {
                      var: ["useTooltipFunction"],
                    },
                    true,
                  ],
                },
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "colorScheme",
                valueKey: "colorScheme",
                label: "Colors",
                help: "Select the line chart color scheme.",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "set1",
                bindable: true,
                data: {
                  values: nivoColorConfigOptions,
                },
              },
              {
                key: "showLegend",
                valueKey: "showLegend",
                component: "toggle",
                label: "Show Legend",
                bindable: true,
              },
              {
                key: "height",
                valueKey: "height",
                label: "Height",
                component: "number-input",
                defaultValue: 350,
              },
              {
                key: "xScaleType",
                valueKey: "xScaleType",
                label: "X Scale",
                component: "radio",
                dataHandlerType: "local",
                hidden: false,
                hideLabel: false,
                invisible: false,
                size: "default",
                bindable: true,
                defaultValue: "point",
                data: {
                  values: [
                    {
                      label: "Point",
                      value: "point",
                    },
                    {
                      label: "Linear",
                      value: "linear",
                    },
                  ],
                },
              },
              {
                key: "yScaleType",
                valueKey: "yScaleType",
                label: "Y Scale",
                component: "radio",
                dataHandlerType: "local",
                hidden: false,
                hideLabel: false,
                invisible: false,
                size: "default",
                bindable: true,
                defaultValue: "linear",
                data: {
                  values: [
                    {
                      label: "Point",
                      value: "point",
                    },
                    {
                      label: "Linear",
                      value: "linear",
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
