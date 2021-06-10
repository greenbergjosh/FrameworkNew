import { SectionDefinition } from "../../../ant/collapse/CollapseInterfaceComponent"

export const tableGroupForm = {
  title: "Group",
  components: [
    {
      key: "allowGrouping",
      valueKey: "allowGrouping",
      label: "Allow Grouping",
      help:
        "If turned off, users will not be able to add, remove, or change the grouping, but it can still be pre-configured below.",
      component: "toggle",
      defaultValue: true,
      size: "small",
      getRootUserInterfaceData: () => void 0,
      onChangeRootData: () => void 0,
    },
    {
      key: "groupOrder",
      valueKey: "groupOrder",
      label: "Order",
      help: "The lowest Order is the first column grouped, followed by the next lowest, and so on",
      component: "number-input",
      size: "small",
      getRootUserInterfaceData: () => void 0,
      onChangeRootData: () => void 0,
    },
  ],
} as SectionDefinition
