import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"
import { colorOptions } from "@opg/interface-builder-plugins/lib/nivo/shared"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
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
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
                help: 'The data must be an array of objects with the properties: { "percentage", "magnitude", "name", "latitude", "longitude" }.',
              },
              {
                key: "markerLimit",
                valueKey: "markerLimit",
                label: "Marker Limit",
                component: "number-input",
                bindable: true,
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
                bindable: true,
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
                bindable: true,
              },
              {
                key: "markerFillColor",
                valueKey: "markerFillColor",
                label: "Marker Color",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "red",
                bindable: true,
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
