import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { Point } from "react-simple-maps"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

type FeatureType = {
  type: string
  id?: string
  properties: { name: string }
  geometry: {
    type: string
    coordinates: any[]
  }
}
export type MapType = {
  type: string
  features: FeatureType[]
}

export interface MapInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "map"
  valueKey: string
  userInterfaceData: UserInterfaceProps["data"]

  // Component specific
  width?: number
  mapName: string
}

export type MarkerType = {
  name: string
  coordinates: [number, number]
  magnitude: number
}

export interface MapInterfaceComponentState {}

export type PositionType = { coordinates: Point; zoom: number }

export interface MapChartProps {
  markers: MarkerType[]
}
