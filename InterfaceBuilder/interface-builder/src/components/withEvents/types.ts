import { NonEmptyString, NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import { Branded } from "io-ts"

export type EventPayloadType = Record<string, unknown>

export type EventBusEventHandler = (eventName: string, eventPayload: EventPayloadType, source: any) => void

export type EventMapItem = {
  type: "none" | "simple" | "lbm"
  simpleMapValue: string
  lbmId: Branded<string, NonEmptyStringBrand>
  lbmSrc: string
  lbmParameters: { [key: string]: string }
}

export type OutgoingEventMap = { [key: string]: EventMapItem }

export type IncomingEventHandler = {
  eventName: string
  handlerFunctionSrc: string
  handlerFunctionParameters: { [key: string]: string }
}

export type EventHandlerSrcStrategy = ((contextLoadById: any, id?: NonEmptyString) => string) | undefined
