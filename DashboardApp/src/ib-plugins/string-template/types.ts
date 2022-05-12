import { StringTemplateInterfaceComponentProps as ParentStringTemplateInterfaceComponentProps } from "@opg/interface-builder-plugins/lib/ant/string-template"
import { PersistedConfig } from "../../api/GlobalConfigCodecs"

export interface StringTemplateInterfaceComponentProps extends ParentStringTemplateInterfaceComponentProps {
  serializeConfigId: PersistedConfig["id"]
  deserializeConfigId: PersistedConfig["id"]
}

export interface StringTemplateInterfaceComponentState {
  serializeSrc?: string
  deserializeSrc?: string
}
