import { StringTemplateInterfaceComponentProps as ParentStringTemplateInterfaceComponentProps } from "@opg/interface-builder-plugins/lib/ant/string-template"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"

export interface StringTemplateInterfaceComponentProps extends ParentStringTemplateInterfaceComponentProps {
  serializeConfigId: PersistedConfig["id"]
  deserializeConfigId: PersistedConfig["id"]
}

export interface StringTemplateInterfaceComponentState {
  serializeSrc?: string
  deserializeSrc?: string
}
