import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const thermometerManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...thermometerManageFormDefinition, ...extend)
}

const colorOptions = [
  {
    label: "Light Grey",
    value: "lightgrey",
  },
  {
    label: "Grey",
    value: "grey",
  },
  {
    label: "Black",
    value: "black",
  },
  {
    label: "Light Blue",
    value: "lightblue",
  },
  {
    label: "Blue",
    value: "blue",
  },
  {
    label: "Light Green",
    value: "lightgreen",
  },
  {
    label: "Green",
    value: "green",
  },
  {
    label: "Light Red",
    value: "pink",
  },
  {
    label: "Red",
    value: "red",
  },
  {
    label: "Light Orange",
    value: "lightorange",
  },
  {
    label: "Orange",
    value: "orange",
  },
  {
    label: "Light Purple",
    value: "violet",
  },
  {
    label: "Purple",
    value: "purple",
  },
  {
    label: "Light Yellow",
    value: "lightyellow",
  },
  {
    label: "Brown",
    value: "brown",
  },
]

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
              },
              {
                key: "valueKey",
                defaultValue: "value",
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
              },
              {
                key: "fillColor",
                valueKey: "fillColor",
                label: "Fill Color",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "red",
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
              },
            ],
          },
        ],
      },
    ],
  },
]
