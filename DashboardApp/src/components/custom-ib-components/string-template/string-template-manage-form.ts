import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const stringTemplateManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...stringTemplateManageFormDefinition, ...extend)
}

export const stringTemplateManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Template",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "components",
                bindable: true,
              },
              {
                key: "serializeConfigId",
                valueKey: "serializeConfigId",
                label: "Serialize",
                help: "Optional. The serialize function must take a JSON object and return a string.",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "Components.StringTemplate.Serialization",
                bindable: true,
              },
              {
                key: "deserializeConfigId",
                valueKey: "deserializeConfigId",
                label: "Deserialize",
                help: `Optional. The deserialize function must take a string and return
                  a JSON object with properties that match each "API Key" used in the embedded controls.`,
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "Components.StringTemplate.Serialization",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "showBorder",
                valueKey: "showBorder",
                component: "toggle",
                defaultValue: true,
                label: "Border",
                bindable: true,
              },
            ],
          },
          {
            key: "style",
            components: [],
          },
        ],
      },
    ],
  },
]
