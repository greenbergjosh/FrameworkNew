import { StringTemplate } from "@opg/interface-builder"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"

export interface StringTemplateInterfaceComponentProps extends StringTemplate.StringTemplateInterfaceComponentProps {
  serializeConfigId: PersistedConfig["id"]
  deserializeConfigId: PersistedConfig["id"]
}

export interface StringTemplateInterfaceComponentState {
  serializeSrc?: string
  deserializeSrc?: string
}
