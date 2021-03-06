import { ComponentDefinition } from "@opg/interface-builder"

export const commonDateForm: ComponentDefinition[] = [
  {
    key: "skeletonFormat",
    valueKey: "skeletonFormat",
    label: "Format",
    component: "select",
    defaultValue: "short",
    dataHandlerType: "local",
    size: "small",
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    data: {
      values: [
        {
          label: "Short",
          value: "short",
          help: "Example: 11/4/16, 1:03 PM",
        },
        {
          label: "Medium",
          value: "medium",
          help: "Example: Nov 4, 2016, 1:03:04 PM",
        },
        {
          label: "Long",
          value: "long",
          help: "Example: November 4, 2016 at 1:03:04 PM GMT+5",
        },
        {
          label: "Full",
          value: "full",
          help: "Example: Friday, November 4, 2016 at 1:03:04 PM GMT+05:30",
        },
        {
          label: "Custom",
          value: "custom",
          help: "Set a custom  format",
        },
      ],
    },
  },
  {
    key: "customFormat",
    valueKey: "customFormat",
    label: "Custom Format",
    component: "input",
    defaultValue: "MM/dd/yyyy hh:mm:ss a",
    size: "small",
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    visibilityConditions: {
      "===": ["custom", { var: "skeletonFormat" }],
    },
  },
]
