import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const emptyManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...emptyManageFormDefinition, ...extend)
}

const emptyManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                hidden: true,
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "message",
                valueKey: "message",
                label: "Message",
                component: "input",
                defaultValue: "No Data",
              },
              {
                key: "image",
                valueKey: "image",
                label: "Image",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "default",
                data: {
                  values: [
                    { label: "Default", value: "default" },
                    { label: "Compact", value: "compact" },
                    { label: "Custom", value: "custom" },
                  ],
                },
              },
              {
                key: "customImage",
                valueKey: "customImage",
                label: "Custom Image",
                component: "input",
                help: "Either a URL to an image or a Base64 encoded Data URL of an image ",
                visibilityConditions: {
                  "===": ["custom", { var: "image" }],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
