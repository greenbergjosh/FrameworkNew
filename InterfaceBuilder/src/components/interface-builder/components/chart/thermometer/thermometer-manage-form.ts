import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { colorOptions } from "components/interface-builder/components/_shared/colors"

export const thermometerManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...thermometerManageFormDefinition, ...extend)
}

const thermometerManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Thermometer",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
              {
                key: "absoluteValueKey",
                valueKey: "absoluteValueKey",
                component: "input",
                label: "Absolute Value Key",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "iconType",
                valueKey: "iconType",
                label: "Icon",
                help: "Select the shape to use as a thermometer.",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "classic",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Classic Thermometer",
                      value: "thermometer",
                    },
                    {
                      label: "Female",
                      value: "female",
                    },
                    {
                      label: "Male",
                      value: "male",
                    },
                  ],
                },
              },
              {
                key: "height",
                valueKey: "height",
                label: "Height",
                defaultValue: 150,
                help: "Height of the thermometer. Width is calculated automatically.",
                component: "number-input",
                bindable: true,
              },
              {
                key: "fillColor",
                valueKey: "fillColor",
                label: "Fill Color",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "red",
                bindable: true,
                data: {
                  values: colorOptions,
                },
              },
              {
                key: "strokeColor",
                valueKey: "strokeColor",
                label: "Line Color",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "black",
                bindable: true,
                data: {
                  values: colorOptions,
                },
              },
              {
                key: "strokeWidth",
                valueKey: "strokeWidth",
                label: "Line Thickness",
                defaultValue: 2,
                component: "number-input",
                bindable: true,
              },
              {
                key: "thermometerLabel",
                valueKey: "thermometerLabel",
                component: "input",
                label: "Thermometer Label",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
