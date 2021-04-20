import { baseManageForm } from "../../../components/BaseInterfaceComponent/baseManageForm"
import { ComponentDefinition } from "../../../globalTypes"

export const richTextEditorManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...richTextEditorManageFormDefinition, ...extend)
}

const richTextEditorManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Input Text",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
