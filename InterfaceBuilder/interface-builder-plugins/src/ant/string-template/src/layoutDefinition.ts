import { QuoteIcon } from "./components/QuoteIcon"

export default {
  category: "Data",
  name: "string-template",
  title: "String Template",
  description: `Edit a string using form controls.
  ADVANCED: You can provide serialize and deserialize functions;
  otherwise, the value will be a serialized JSON string.
  The serialize function must take a JSON object and return a string.
  The deserialize function must take a string and return
  a JSON object with properties that match each "API Key" used in the embedded controls.`,
  iconComponent: QuoteIcon,
  componentDefinition: {
    component: "string-template",
    components: [],
  },
}
