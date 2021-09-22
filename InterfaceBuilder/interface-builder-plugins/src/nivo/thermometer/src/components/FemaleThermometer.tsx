import React, { useEffect, useState } from "react"
import { IconProps } from "../types"
import { inRange } from "lodash/fp"

// Intrinsic values from the original SVG artwork
const artHeight = 572
const artWidth = 265

function FemaleShape() {
  return (
    <g id="female">
      <circle cx="130.95011" cy="46.58577" r="46.54521" />
      <path d="M124.50539,388.15534V549.98933C124.26193,579.39154,80.494976,579.39154,80.108304,549.98933V388.15534H22.821751L84.404788,171.89962H74.379644L38.57554,295.0651C29.524278,322.30474,-7.3109962,311.27714,1.3392857,282.17574L41.43986,148.98509C46.051436,133.68965,65.32836,106.68061,98.726432,106.02037H128.80188H163.17384C195.6095,106.68061,214.96663,133.91881,220.46041,148.98509L260.56101,282.17574C268.69571,311.1339,232.15259,323.02082,223.32473,295.0651L187.52063,171.89962H176.06331L239.07855,388.15534H180.3598V549.98933C180.8181,579.39154,137.22302,579.2483,137.39487,549.98933V388.15534H124.50539z" />
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
        <mask id="femaleMask">
          <g fill="white">
            <FemaleShape />
          </g>
        </mask>
      </defs>
      <g transform="translate(0,0)">
        <rect
          x="0"
          y={dims.mercuryTop}
          width={artWidth}
          height={dims.mercuryHeight}
          mask="url(#femaleMask)"
          fill={fillColor}
        />
      </g>
      <g fill="none" stroke={strokeColor} strokeWidth={strokeWidth} transform="translate(0,0)">
        <FemaleShape />
      </g>
    </svg>
  )
}
