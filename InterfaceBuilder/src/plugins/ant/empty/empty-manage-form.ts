import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

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
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "message",
                valueKey: "message",
                label: "Message",
                component: "input",
                defaultValue: "No Data",
                bindable: true,
              },
              {
                key: "image",
                valueKey: "image",
                label: "Image",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "default",
                bindable: true,
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
                bindable: true,
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
