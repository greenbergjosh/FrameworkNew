import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"
import { getIconSelectConfig } from "./getIconSelectConfig"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...iconManageFormDefinition, ...extend)
}

export const iconManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                key: "hideLabel",
                defaultValue: true,
                hidden: true,
              },
              {
                key: "valueKey",
                defaultValue: "icon",
                label: "Icon Value Key",
                bindable: true,
              },
              {
                center: false,
                headerSize: "4",
                textType: "info",
                invisible: false,
                hidden: false,
                stringTemplate:
                  "When an Icon Value Key is provided above, that icon is used first. But if an icon is not available, then the icon selected below is used.",
                useTokens: false,
                valueKey: "data",
                label: "Text",
                hideLabel: true,
                component: "text",
                marginBottom: 20,
                components: [],
              },
              {
                ...getIconSelectConfig(),
              },
            ],
          },
          {
            key: "appearance",
            components: [],
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
