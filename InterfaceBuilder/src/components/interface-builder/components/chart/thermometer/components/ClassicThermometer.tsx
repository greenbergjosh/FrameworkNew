import React, { useEffect, useState } from "react"
import { IconProps } from "../types"

// Intrinsic values from the original SVG artwork
const artHeight = 295
const artWidth = 80
const artMercuryHeight = 212
const artMercuryTop = 13
const artMercuryBottom = artMercuryHeight + artMercuryTop

function MercuryBulb() {
  return (
    <path d="M40,286.213 C22.628,286.213 8.544,272.062 8.544,254.605 C8.544,237.149 22.628,222.997 40,222.997 C57.372,222.997 71.456,237.149 71.456,254.605 C71.456,272.062 57.372,286.213 40,286.213 z" />
  )
}

function ClassicThermometer() {
  return (
    <>
      {/*
       * Tube Inner and Outer Borders
       */}
      <path d="M40.371,0.5 C51.073,0.679 58.718,9.065 59.24,19.468 L59.241,19.468 L59.465,219.944 C72.607,226.828 80.132,240.605 80.5,255.186 C80.5,277.32 62.591,295.263 40.5,295.263 C18.409,295.263 0.5,277.32 0.5,255.186 C0.561,240.528 8.631,226.966 21.5,219.963 L21.5,19.468 L21.502,19.468 C21.676,8.787 29.944,1.03 40.371,0.5 z" />
      <path d="M40.439,13.447 C45.498,13.532 49.113,17.496 49.359,22.414 L49.36,22.414 L49.474,225.02 C59.401,227.423 67.597,236.263 70.541,245.825 C71.86,250.108 71.763,251.386 71.956,255.197 C71.956,272.603 57.872,286.713 40.5,286.713 C23.128,286.713 9.044,272.603 9.044,255.197 C9.249,243.712 15.307,233.017 25.506,227.484 C29.233,225.463 29.272,225.48 31.518,225.021 L31.518,22.414 L31.519,22.414 C31.601,17.365 35.51,13.698 40.439,13.447 z" />
      {/*
       * Gradient Marks
       */}
      <path d="M41.882,66.447 L59.079,66.447" />
      <path d="M41.882,119.447 L59.079,119.447" />
      <path d="M41.882,172.447 L59.079,172.447" />
    </>
  )
}

export default function ({ height = 150, strokeColor = "black", strokeWidth = 2, fillColor, value = 1 }: IconProps) {
  const [dims, setDims] = useState({
    mercuryHeight: artMercuryHeight,
    mercuryTop: artMercuryBottom,
    offset: -1,
    widthWithStroke: artWidth + 2,
    heightWithStroke: artHeight + 2,
  })

  useEffect(() => {
    // Mercury dims
    const mercuryHeight = artMercuryHeight * value
    const mercuryTop = artMercuryBottom - mercuryHeight

    // Entire artwork dims
    const offset = (strokeWidth / 2) * -1
    const widthWithStroke = artWidth + strokeWidth
    const heightWithStroke = artHeight + strokeWidth

    setDims({ mercuryHeight, mercuryTop, offset, widthWithStroke, heightWithStroke })
  }, [value, strokeWidth])

  return (
    <svg height={height} viewBox={`${dims.offset} ${dims.offset} ${dims.widthWithStroke} ${dims.heightWithStroke}`}>
      <g fill={fillColor} strokeWidth={0}>
        <MercuryBulb />
      </g>
      <g fill={fillColor} strokeWidth={0}>
        <rect x="31" y={dims.mercuryTop - 2} width="18" height={dims.mercuryHeight + 10}  rx="10" />
      </g>
      <g fill="none" stroke={strokeColor} strokeWidth={strokeWidth} transform="translate(0,0)">
        <ClassicThermometer />
      </g>
    </svg>
  )
}
