import React from "react"
import { allStates, offsets } from "../map-data/allStates"
import { Annotation, Marker } from "react-simple-maps"
import { geoCentroid } from "d3-geo"
import { StateNameMarkerProps } from "../types"

/**
 * See https://www.react-simple-maps.io/examples/usa-with-state-labels/
 * @param geo
 * @constructor
 */
export function StateNameMarker({ geo }: StateNameMarkerProps) {
  const centroid = geoCentroid(geo)
  const cur = allStates.find((s) => s.val === geo.id)
  const fontSize = 10
  const fontColor = "grey" //foo

  return (
    <g key={`${geo.rsmKey}-name`}>
      {cur &&
        centroid[0] > -160 &&
        centroid[0] < -67 &&
        (Object.keys(offsets).indexOf(cur.id) === -1 ? (
          <Marker coordinates={centroid}>
            <text y={2} fontSize={fontSize} textAnchor="middle" color={fontColor}>
              {cur.id}
            </text>
          </Marker>
        ) : (
          <Annotation
            subject={centroid}
            // @ts-ignore
            dx={offsets[cur.id][0]}
            // @ts-ignore
            dy={offsets[cur.id][1]}
            connectorProps={{}}>
            <text x={4} fontSize={fontSize} alignmentBaseline="middle" color={fontColor}>
              {cur.id}
            </text>
          </Annotation>
        ))}
    </g>
  )
}
