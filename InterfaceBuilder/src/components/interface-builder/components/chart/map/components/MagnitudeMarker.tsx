import { Marker, Point } from "react-simple-maps"
import { Tooltip } from "antd"
import React from "react"
import { MagnitudeMarkerProps } from "../types"
import { formatNumber } from "components/interface-builder/util/utils"
import getColor from "components/interface-builder/components/_shared/colors"

export function MagnitudeMarker({ marker, color = "red" }: MagnitudeMarkerProps) {
  const { percentage, magnitude, name, latitude, longitude } = marker
  const coordinates: Point = [parseFloat(longitude), parseFloat(latitude)]
  const min = 1
  const max = 1000
  const size = max * parseFloat(percentage)
  const radius = size > min ? size : min
  const opacity = (1 / size) * 10
  const title = `${name}: ${formatNumber(magnitude)}`
  const fill = getColor(color, opacity)

  return (
    <Marker coordinates={coordinates}>
      <Tooltip title={title}>
        <circle r={radius} fill={fill} stroke="" strokeWidth={0} />
      </Tooltip>
    </Marker>
  )
}
