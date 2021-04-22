import { baseManageForm } from "../../../components/BaseInterfaceComponent/baseManageForm"
import { ComponentDefinition } from "../../../globalTypes"

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
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
                bindable: true,
              },
              {
                key: "src",
                valueKey: "src",
                component: "input",
                label: "IFrame URL",
                defaultValue: "https://",
                bindable: true,
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
                bindable: true,
              },
              {
                key: "height",
                valueKey: "height",
                label: "Height",
                component: "number-input",
                defaultValue: 500,
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
