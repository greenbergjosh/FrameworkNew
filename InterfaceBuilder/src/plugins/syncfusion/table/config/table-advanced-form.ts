import { SectionDefinition } from "../../../ant/collapse/CollapseInterfaceComponent"

export const tableAdvancedForm = {
  title: "Advanced",
  components: [
    {
      key: "allowHTMLText",
      valueKey: "allowHTMLText",
      label: "Allow HTML Text",
      help: "If true, text containing HTML markup will be rendered as HTML rather than as raw text",
      component: "toggle",
      defaultValue: false,
      size: "small",
    },
    {
      key: "removeCellPadding",
      valueKey: "removeCellPadding",
      label: "Remove Cell Padding",
      help: "Removes the default spacing around cell contents to make more readable",
      component: "toggle",
      defaultValue: false,
      size: "small",
    },
    {
      key: "maxWidth",
      valueKey: "maxWidth",
      label: "Max Width",
      help:
        'Maximum width of the column. Consider setting "Wrap Mode" on the grid to allow text to wrap in this column.',
      component: "number-input",
      size: "small",
    },
    {
      key: "cellFormatter",
      valueKey: "cellFormatter",
      component: "select",
      label: "Cell Formatter",
      help: "Custom format content of the cells in this column",
      dataHandlerType: "remote-config",
      remoteConfigType: "Report.CellFormatter",
      size: "small",
    },
    {
      key: "cellFormatterOptions",
      valueKey: "cellFormatterOptions",
      label: "Cell Formatter Options",
      help: "Give additional properties to format the cell content",
      component: "data-map",
      defaultValue: [],
      multiple: true,
      keyComponent: {
        label: "Key",
        component: "input",
        valueKey: "key",
        size: "small",
      },
      valueComponent: {
        label: "Value",
        component: "textarea",
        valueKey: "value",
        size: "small",
      },
      visibilityConditions: {
        "!!": { var: ["cellFormatter"] },
      },
    },
  ],
} as SectionDefinition
