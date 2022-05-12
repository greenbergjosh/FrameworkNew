import { AppConfig, AppPageConfig } from "./types"

export const DEFAULT_APP_CONFIG: AppConfig = {
  id: "",
  title: "...",
  uri: "",
  link: "",
  description: null,
  icon: "loading",
  disabled: false,
  views: [],
  navigation: [],
  parameters: {},
}

export const DEFAULT_APP_PAGE_CONFIG: AppPageConfig = {
  id: "",
  title: "...",
  uri: "",
  link: "",
  description: null,
  icon: null,
  disabled: false,
  hideTitle: false,
  layout: [],
  parameters: {},
}
