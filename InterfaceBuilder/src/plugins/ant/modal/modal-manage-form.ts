import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const modalManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...ModalManageFormDefinition, ...extend)
}

const ModalManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                bindable: true,
              },
              {
                key: "hideLabel",
                hidden: true,
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
                bindable: true,
              },
              {
                key: "showKey",
                valueKey: "showKey",
                component: "input",
                defaultValue: "showModal",
                label: "Show Key",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "title",
                valueKey: "title",
                component: "input",
                defaultValue: "Edit Item",
                label: "Modal Title",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
