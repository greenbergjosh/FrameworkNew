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
  mapType: string
  markerFillColor?: string
}

export type MarkerType = {
  latitude: string
  longitude: string
  magnitude: number
  name: string
  percentage: string
}

export interface MapInterfaceComponentState {
  markers?: MarkerType[]
  loading: boolean
}

export type PositionType = { coordinates: Point; zoom: number }

export interface MapChartProps {
  markers?: MarkerType[]
  markerFillColor?: string
}

export interface MagnitudeMarkerProps {
  marker: MarkerType
  color?: string
}

export interface StateNameMarkerProps {
  geo: any
}
