import React, { FunctionComponent, useState } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import states from "../maps/states-10m"
import { MapChartProps, PositionType } from "../types"
import { MagnitudeMarker } from "./MagnitudeMarker"
import { ZoomControls } from "components/interface-builder/components/chart/map/components/ZoomControls"

const initialPos: PositionType = { coordinates: [-95.7129, 37.0902], zoom: 1 }

const UsaMap: FunctionComponent<MapChartProps> = ({ markers }) => {
  const [position, setPosition] = useState<PositionType>(initialPos)

  function handleZoomIn() {
    if (position.zoom >= 4) return // Max zoom 4x
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }))
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return // Min zoom 1x
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }))
  }

  function handleMoveEnd(position: PositionType) {
    setPosition(position)
  }

  function handleReset() {
    setPosition(initialPos)
  }

  return (
    <>
      <ComposableMap projection="geoAlbersUsa">
        <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={handleMoveEnd}>
          <Geographies geography={states}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => (
                  <Geography key={geo.rsmKey} stroke="#FFF" geography={geo} fill="#DDD" />
                ))}
              </>
            )}
          </Geographies>
          {markers &&
            markers.map(({ name, coordinates, magnitude }) => (
              <MagnitudeMarker key={name} numbers={coordinates} name={name} magnitude={magnitude}  />
            ))}
        </ZoomableGroup>
      </ComposableMap>
      <ZoomControls onZoomOut={handleZoomOut} onReset={handleReset} onZoomIn={handleZoomIn} />
    </>
  )
}

export default UsaMap
