import { AppConfig, AppPageConfig } from "./types"

export const DEFAULT_APP_CONFIG: AppConfig = {
  id: "",
  title: "...",
  uri: "",
  description: null,
  icon: "loading",
  disabled: false,
  views: [],
  navigation: [],
}

export const DEFAULT_APP_PAGE_CONFIG: AppPageConfig = {
  id: "",
  title: "...",
  uri: "",
  description: null,
  icon: null,
  disabled: false,
  layout: [],
}
