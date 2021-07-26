import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { UserInterfaceProps } from "../globalTypes"
import { DataBindings } from "../components/BaseInterfaceComponent/types"
import { EventPayloadType, IncomingEventHandler, OutgoingEventMap } from "../components/withEvents/types"

export interface ComponentDefinitionNamedProps {
  key: string
  abstract?: boolean
  component: string
  defaultValue?: any
  help?: string
  hidden?: boolean
  invisible?: boolean
  hideLabel?: boolean
  label?: string
  name?: string
  preview?: boolean
  visibilityConditions?: JSONObject
  bindable?: boolean
  bindings?: DataBindings
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  incomingEventHandlers: IncomingEventHandler[]
  outgoingEventMap: OutgoingEventMap
  summary?: JSX.Element

  [key: string]: unknown

  onRaiseEvent?: ((eventName: string, eventPayload: EventPayloadType, source: any) => void) | undefined
  classNames?: string[]
}

export interface ComponentDefinitionRecursiveProp {
  [key: string]: ComponentDefinition[]
}

export interface ComponentRenderMetaProps {
  mode?: UserInterfaceProps["mode"]
  userInterfaceData?: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeData?: UserInterfaceProps["onChangeData"]
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
  submit?: UserInterfaceProps["submit"]
}

/**
 * ComponentDefinition
 */
export type ComponentDefinition =
  | ComponentDefinitionNamedProps
  | (ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp)
