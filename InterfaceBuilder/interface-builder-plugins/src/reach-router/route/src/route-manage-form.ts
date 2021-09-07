import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const routeManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...RouteManageFormDefinition, ...extend)
}

export const RouteManageFormDefinition: Partial<ComponentDefinition>[] = [
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
              },
              {
                key: "valueKey",
                defaultValue: "",
                bindable: true,
                hidden: true,
              },
              {
                key: "path",
                valueKey: "path",
                component: "input",
                label: "Path",
                bindable: true,
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
