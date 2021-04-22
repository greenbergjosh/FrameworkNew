import { Marker, Point } from "react-simple-maps"
import { Tooltip } from "antd"
import React from "react"
import { isMarker, MagnitudeMarkerProps } from "../types"
import { formatNumber } from "../../../../lib/formatNumber"
import getColor from "../../../../plugins/nivo/_shared/colors"

/**
 * IMPORTANT: d3-geo specifies coordinate as [lon, lat]
 * https://www.react-simple-maps.io/docs/marker/
 * https://developers.google.com/maps/documentation/javascript/reference/coordinates
 * Improper coordinate can throw: "Uncaught TypeError: Invalid attempt to destructure non
 * @param marker
 * @param color
 * @param projection
 * @constructor
 */
export function MagnitudeMarker({ marker, color = "red", projection }: MagnitudeMarkerProps) {
  if (!isMarker(marker)) {
    console.warn(
      "Map: MagnitudeMarker",
      'Invalid Map Marker Data! Marker data must be an object with these properties: { "percentage", "magnitude", "name", "latitude", "longitude" }.'
    )
    return null
  }

  const { percentage, magnitude, name, latitude, longitude } = marker
  // d3-geo specifies coordinate as [lon, lat]
  const coordinates: Point = [parseFloat(longitude), parseFloat(latitude)]
  const min = 1
  const max = 1000
  const size = max * parseFloat(percentage)
  const radius = size > min ? size : min
  const opacity = (1 / size) * 10
  const title = `${name}: ${formatNumber(magnitude)}`
  const fill = getColor(color, opacity)

  // Create a plot point to test if the coordinates are valid.
  // If the point is null, then the coordinates are invalid
  // or don't appear on the map.
  const testPoint = projection(coordinates)
  if (!testPoint) {
    return null
  }

  return (
    <Marker coordinates={coordinates}>
      <Tooltip title={title}>
        <circle r={radius} fill={fill} stroke="" strokeWidth={0} />
      </Tooltip>
    </Marker>
  )
}
