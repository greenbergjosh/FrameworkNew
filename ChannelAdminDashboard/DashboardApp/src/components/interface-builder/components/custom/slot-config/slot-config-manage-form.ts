import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const slotConfigManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...slotConfigManageFormDefinition, ...extend)
}

const slotConfigManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Slot Config",
              },
              {
                key: "valueKey",
                defaultValue: "seqs",
              },
              {
                key: "providerType",
                valueKey: "providerType",
                label: "Provider Type",
                component: "select",
                placeholder: "Select an Provider Type",
                required: true,
                dataHandlerType: "remote-config",
              },
              {
                key: "actionType",
                valueKey: "actionType",
                label: "Action Type",
                component: "select",
                placeholder: "Select an Action Type",
                required: true,
                dataHandlerType: "remote-config",
                remoteConfigType: "KeyValuePairs",
              },
            ],
          },
        ],
      },
    ],
  },
]
