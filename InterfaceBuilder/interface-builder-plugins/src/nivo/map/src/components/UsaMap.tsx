import React, { FunctionComponent, useState } from "react"
import states from "../map-data/states-10m"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { MagnitudeMarker } from "./MagnitudeMarker"
import { MapChartProps, PositionType } from "../types"
import { StateNameMarker } from "./StateNameMarker"
import { ZoomControls } from "./ZoomControls"

const initialPos: PositionType = { coordinates: [-95.7129, 37.0902], zoom: 1 }

const UsaMap: FunctionComponent<MapChartProps> = ({ markers, markerFillColor }) => {
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
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={1}>
          <Geographies geography={states}>
            {({ geographies, projection }) => (
              <>
                {geographies.map((geo) => (
                  <React.Fragment key={`map-geo-${geo.rsmKey}`}>
                    <Geography stroke="#FFF" geography={geo} fill="#DDD" />
                    <StateNameMarker geo={geo} />
                  </React.Fragment>
                ))}
                {markers &&
                  markers.map((marker, index) => (
                    <MagnitudeMarker
                      key={`map-marker-${index}`}
                      marker={marker}
                      projection={projection}
                      color={markerFillColor}
                    />
                  ))}
              </>
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <ZoomControls onZoomOut={handleZoomOut} onReset={handleReset} onZoomIn={handleZoomIn} />
    </>
  )
}

export default UsaMap
