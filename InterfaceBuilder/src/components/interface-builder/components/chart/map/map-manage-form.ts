import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { colorOptions } from "components/interface-builder/components/_shared/colors"

export const mapManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...mapManageFormDefinition, ...extend)
}

const mapManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Geo Map",
              },
              {
                key: "valueKey",
                defaultValue: "value",
                help:
                  'The data must be an array of objects with the properties: { "percentage", "magnitude", "name", "latitude", "longitude" }.',
              },
              {
                key: "markerLimit",
                valueKey: "markerLimit",
                label: "Marker Limit",
                component: "number-input",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "mapType",
                valueKey: "mapType",
                label: "Map",
                help: "Select the map features to display",
                component: "select",
                defaultValue: "usaStates",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "USA States",
                      value: "usaStates",
                    },
                    // {
                    //   label: "World Countries",
                    //   value: "worldCountries",
                    // },
                  ],
                },
              },
              {
                key: "width",
                valueKey: "width",
                label: "Width",
                help: "Width in pixels. Height is determined by the component.",
                component: "number-input",
              },
              {
                key: "markerFillColor",
                valueKey: "markerFillColor",
                label: "Marker Color",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "red",
                data: {
                  values: colorOptions,
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
