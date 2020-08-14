import React, { useEffect, useState } from "react"
import { IconProps } from "../types"
import { inRange } from "lodash/fp"

// Intrinsic values from the original SVG artwork
const artHeight = 572
const artWidth = 222

function MaleShape() {
  return (
    <g id="male" transform="translate(-400,0)">
      <circle cx="511.90545" cy="46.58577" r="46.54521" />
      <path d="M462.49589,106.02037C426.70613,106.02037,403.77713,137.00793,403.77713,167.60313V310.81886C403.44773,338.80318,443.74313,338.80318,443.87777,310.81886V179.06038H453.90289V542.82853C453.28133,580.80938,506.95025,579.72094,506.89297,542.82853V330.86906H515.48597V542.82853C516.18773,579.72094,570.13733,580.80938,569.90817,542.82853V179.06038H579.93333V310.81886C579.46073,339.01802,619.54701,339.01802,620.03389,310.81886V167.60313C619.46109,137.00793,595.67281,106.56889,559.88305,106.02037H462.49589z" />
    </g>
  )
}

export default function ({ height, strokeColor, strokeWidth, fillColor, value }: IconProps) {
  const [dims, setDims] = useState({
    mercuryHeight: artHeight,
    mercuryTop: artHeight,
    offset: -1,
    widthWithStroke: artWidth + 2,
    heightWithStroke: artHeight + 2,
  })

  useEffect(() => {
    // Mercury dims
    const defaultedValue = inRange(0, 1, value) ? value : 0
    const mercuryHeight = artHeight * defaultedValue
    const mercuryTop = artHeight - mercuryHeight

    // Entire artwork dims
    const defaultedStrokeWidth = strokeWidth || 2
    const widthWithStroke = artWidth + defaultedStrokeWidth
    const heightWithStroke = artHeight + defaultedStrokeWidth
    const offset = (defaultedStrokeWidth / 2) * -1

    setDims({ mercuryHeight, mercuryTop, offset, widthWithStroke, heightWithStroke })
  }, [value, strokeWidth])

  return (
    <svg height={height} viewBox={`${dims.offset} ${dims.offset} ${dims.widthWithStroke} ${dims.heightWithStroke}`}>
      <defs>
        <mask id="maleMask">
          <g fill="white">
            <MaleShape />
          </g>
        </mask>
      </defs>
      <g transform="translate(0,0)">
        <rect
          x="0"
          y={dims.mercuryTop}
          width={artWidth}
          height={dims.mercuryHeight}
          mask="url(#maleMask)"
          fill={fillColor}
        />
      </g>
      <g fill="none" stroke={strokeColor} strokeWidth={strokeWidth} transform="translate(0,0)">
        <MaleShape />
      </g>
    </svg>
  )
}
