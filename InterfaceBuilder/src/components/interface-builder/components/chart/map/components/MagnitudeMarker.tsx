import { Marker, Point } from "react-simple-maps"
import { Tooltip } from "antd"
import React from "react"

export function MagnitudeMarker(props: { numbers: number[]; name: string; magnitude: number }) {
  return (
    <Marker coordinates={(props.numbers as unknown) as Point}>
      <Tooltip title={`${props.name}: ${props.magnitude}`}>
        <circle r={props.magnitude} fill={`rgba(255,0,0,${(1 / props.magnitude) * 10})`} stroke="" strokeWidth={0} />
      </Tooltip>
    </Marker>
  )
}

