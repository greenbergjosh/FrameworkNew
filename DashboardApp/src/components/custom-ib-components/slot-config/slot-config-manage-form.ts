import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

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
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "seqs",
                bindable: true,
              },
              {
                key: "providerType",
                valueKey: "providerType",
                label: "Provider Type",
                component: "select",
                placeholder: "Select an Provider Type",
                required: true,
                dataHandlerType: "remote-config",
                bindable: true,
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
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
