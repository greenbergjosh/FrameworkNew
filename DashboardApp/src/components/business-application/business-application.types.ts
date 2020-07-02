import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { ComponentDefinition } from "@opg/interface-builder"

interface LabeledType {
  configType: PersistedConfig["id"]
  label: string
}

export interface IBusinessAppNavigationItem {
  key: string
  title: string
  icon?: string
  isLeaf: boolean
}

export interface BusinessAppNavigationGroup extends IBusinessAppNavigationItem {
  children: BusinessAppNavigationItem[]
  isLeaf: false
}

export interface BusinessAppNavigationPage extends IBusinessAppNavigationItem {
  page: PersistedConfig["id"]
  isLeaf: true
}

export type BusinessAppNavigationItem = BusinessAppNavigationPage | BusinessAppNavigationGroup

export interface BusinessApplicationConfig {
  // Configuration
  administered_types: LabeledType[]
  application_config: PersistedConfig["id"][]
  description: string
  export_config: PersistedConfig["id"][]
  ingest_config: PersistedConfig["id"][]
  owner: PersistedConfig["id"][]
  report: PersistedConfig["id"][]

  // Pages
  navigation: BusinessAppNavigationItem[]
}

export interface BusinessApplicationPageConfig {
  layout: ComponentDefinition[]
}

export type BusinessApplicationId = string
export type BusinessApplicationPageId = string
