import { ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { Point } from "react-simple-maps"

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
  markerLimit?: number
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
  projection: any
}

export interface StateNameMarkerProps {
  geo: any
}

/**
 * Validate Marker
 * @param marker
 * @return boolean
 */
export function isMarker(marker: MarkerType): boolean {
  const requiredKeys = ["percentage", "magnitude", "name", "latitude", "longitude"]
  return requiredKeys.every((k) => k in marker)
}
