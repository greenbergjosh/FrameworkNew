import { mergeAllWith, mergeWith } from "lodash/fp"
import { ComponentDefinition } from "./BaseInterfaceComponent"

interface HasKey {
  key: string
}
const mergeHandler = (value: any, srcValue: any, key?: any) => {
  if (Array.isArray(value) && Array.isArray(srcValue)) {
    const { items, remaining } = srcValue.reduce(
      (acc: { items: HasKey[]; remaining: HasKey[] }, item) => {
        const mergeableIndex: number = acc.remaining.findIndex((i) => !!i.key && i.key === item.key)
        if (mergeableIndex >= 0) {
          acc.items.push(mergeWith(mergeHandler, acc.remaining[mergeableIndex], item) as HasKey)
          acc.remaining.splice(mergeableIndex, 1)
        } else {
          acc.items.push(item)
        }
        return acc
      },
      { items: [], remaining: [...value] }
    )
    console.log("base-component-form.mergeHandler", "both array", {
      items,
      remaining,
      result: items.concat(remaining),
    })
    return items.concat(remaining)
  } else {
    console.log("base-component-form.mergeHandler", "non-array", { value, srcValue, key })
  }
}

export const baseManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  if (extend.length) {
    return mergeHandler(extend, baseManageFormDefinition) as ComponentDefinition[]
    // return _(baseManageFormDefinition)
    //   .concat(...(extend as ComponentDefinition[]))
    //   .groupBy("key")
    //   .map(_.spread(_.merge))
    //   .value()
  }
  return baseManageFormDefinition
}

const baseManageFormDefinition: ComponentDefinition[] = [
  {
    key: "base",
    component: "form",
    components: [
      {
        key: "tabs",
        defaultActiveKey: "data",
        component: "tabs",
        tabs: [
          {
            key: "data",
            component: "tab",
            hideLabel: true,
            label: "Data",
            components: [
              {
                key: "hideLabel",
                ordinal: 0,
                component: "checkbox",
                defaultValue: false,
                label: "Hide Label",
                help: "Whether or not to hide the label of this field.",
              },
              {
                key: "label",
                ordinal: 0,
                component: "input",
                label: "Label",
                visibilityConditions: {
                  "!==": [
                    true,
                    {
                      var: ["hideLabel"],
                    },
                  ],
                },
              },
            ],
          },
          {
            key: "visibility",
            component: "tab",
            hideLabel: true,
            label: "Visibility",
            components: [
              {
                key: "hidden",
                ordinal: 10,
                component: "checkbox",
                label: "Hidden",
              },
            ],
          },
        ],
      },
    ],
  },
]
