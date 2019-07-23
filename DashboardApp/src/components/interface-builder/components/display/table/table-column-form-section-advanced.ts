import { SectionDefinition } from "../collapse/CollapseInterfaceComponent"

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
    },
  ],
} as SectionDefinition
