import { BusinessApplicationConfig, BusinessApplicationPageConfig } from "./types"

export const DEFAULT_BUSINESS_APPLICATION_CONFIG: BusinessApplicationConfig = {
  administered_types: [],
  application_config: [],
  description: "",
  export_config: [],
  ingest_config: [],
  navigation: [],
  owner: [],
  report: [],
  title: "Business App",
}

export const DEFAULT_BUSINESS_APPLICATION_PAGE_CONFIG: BusinessApplicationPageConfig = {
  description: "",
  hasPadding: false,
  hasWhiteBackground: false,
  layout: [],
  title: "Business App",
}
