import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

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
              },
              {
                key: "mapName",
                valueKey: "mapName",
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
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "width",
                valueKey: "width",
                label: "Width",
                help: "Width in pixels. Height is determined by the component.",
                component: "number-input",
              },
            ],
          },
        ],
      },
    ],
  },
]
