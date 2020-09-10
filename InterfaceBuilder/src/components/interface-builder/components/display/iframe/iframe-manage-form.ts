import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const iframeManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...iFrameManageFormDefinition, ...extend)
}

const iFrameManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "IFrame",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
              },
              {
                key: "src",
                valueKey: "src",
                component: "input",
                label: "IFrame URL",
                defaultValue: "https://",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "bordered",
                valueKey: "bordered",
                component: "toggle",
                label: "Show Border",
                defaultValue: false,
              },
              {
                key: "height",
                valueKey: "height",
                label: "Height",
                component: "number-input",
                defaultValue: 500,
              },
            ],
          },
        ],
      },
    ],
  },
]
