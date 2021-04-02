import { PieDatum } from "@nivo/pie"
import { OrdinalColorsInstruction } from "@nivo/colors"
import { LegendProps } from "@nivo/legends"
import { isEmpty, toNumber } from "lodash/fp"
import {
  OtherSliceAggregatorFunction,
  PieInterfaceComponentProps,
  SliceLabelValueFunction,
  SliceLabelValueType,
} from "components/interface-builder/components/chart/pie/types"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

export const emptyDataSet = [{ pieDatum: { id: "None", label: "No data", value: 1 }, slice: {} }]

function createSliceData({
  id,
  labelName,
  labelValue,
  value,
}: {
  id: string
  labelName: string
  labelValue: string
  value: number
}): PieDatum {
  return {
    id,
    value,
    label: labelName,
    sliceLabel: labelValue,
  }
}

function getLabelValue({
  data,
  labelValueType,
  labelValueKey,
  labelValueFunction,
  valueKey,
  props,
}: {
  data: JSONRecord
  labelValueType: SliceLabelValueType
  labelValueFunction?: SliceLabelValueFunction
  labelValueKey: string
  valueKey: string
  props: any
}): string {
  switch (labelValueType) {
    case "default":
      return data[valueKey]?.toString() ?? ""
    case "function":
      return labelValueFunction
        ? tryCatch(() => labelValueFunction(data, props)).getOrElse(data[valueKey]?.toString() ?? "")
        : data[valueKey]?.toString() ?? ""
    case "key":
      return data[labelValueKey]?.toString() ?? ""
  }
}

function getSliceRawData({
  data,
  labelNameKey,
  labelValueType,
  labelValueKey,
  labelValueFunction,
  valueKey,
  props,
}: {
  data: JSONRecord
  labelNameKey: string
  labelValueType: SliceLabelValueType
  labelValueFunction?: SliceLabelValueFunction
  labelValueKey: string
  valueKey: string
  props: any
}) {
  const rawValue = toNumber(data[valueKey])
  const value = isNaN(rawValue) ? 0 : rawValue
  const labelName: string = data[labelNameKey]?.toString() ?? ""
  const labelValue = getLabelValue({ data, labelValueType, labelValueKey, labelValueFunction, valueKey, props })
  return { value, labelName, labelValue }
}

export function convertToPieDatum({
  data,
  labelNameKey,
  labelValueType,
  labelValueKey,
  labelValueFunction,
  valueKey,
  dataIsPreSorted,
  threshold,
  otherSliceAggregatorFunction,
  props,
}: {
  data: JSONRecord[]
  labelNameKey: string
  labelValueType: SliceLabelValueType
  labelValueKey: string
  labelValueFunction?: SliceLabelValueFunction
  valueKey: string
  dataIsPreSorted: boolean
  threshold: number
  otherSliceAggregatorFunction?: OtherSliceAggregatorFunction
  props: PieInterfaceComponentProps
}): { pieDatum: PieDatum; slice: JSONRecord }[] {
  // Return if nothing to do
  if (isEmpty(data)) return emptyDataSet
  if (!data.map || data.length < 1) return emptyDataSet

  const belowThreshold: { pieDatum: PieDatum; slice: JSONRecord }[] = []
  const slices: JSONRecord[] = []

  // Convert to PieDatum[]
  let index = 0
  const pieData = data.reduce((acc, datum) => {
    const { value, labelName, labelValue } = getSliceRawData({
      data: datum,
      labelNameKey,
      labelValueType,
      labelValueKey,
      labelValueFunction,
      valueKey,
      props,
    })
    const pieDatum = createSliceData({
      id: index.toString(),
      labelName,
      labelValue,
      value,
    })

    if (threshold > 0 && value < threshold) {
      belowThreshold.push({ pieDatum, slice: datum })
    } else {
      acc.push(pieDatum)
      slices.push(datum)
      index++
    }

    return acc
  }, [] as PieDatum[])

  if (!dataIsPreSorted) {
    pieData.sort((a: { value: number }, b: { value: number }) => b.value - a.value)
  }

  // Gather values below the threshold into an "Other" PieDatum
  if (threshold > 0 && belowThreshold.length > 0) {
    const defaultOtherSlice = createSliceData({
      id: pieData.length.toString(),
      labelName: "Others",
      labelValue: "Others",
      value: 0,
    })

    const aggregate = belowThreshold
      .map((value) => value.pieDatum)
      .reduce((acc, pieDatum) => {
        acc.value += pieDatum.value
        return acc
      }, defaultOtherSlice)

    let aggregateSlice: JSONRecord = {}
    if (otherSliceAggregatorFunction) {
      aggregateSlice = otherSliceAggregatorFunction(
        belowThreshold.map((value) => value.slice),
        props
      )
    }

    aggregate.sliceLabel = getLabelValue({
      data: aggregateSlice,
      labelValueType,
      labelValueKey,
      labelValueFunction,
      valueKey,
      props,
    })

    pieData.push(aggregate)
    slices.push(aggregateSlice)
  }

  return pieData.map((pieDatum, index) => ({ pieDatum, slice: slices[index] }))
}

export const legends: LegendProps[] = [
  {
    anchor: "bottom",
    direction: "row",
    translateY: 56,
    itemWidth: 100,
    itemHeight: 18,
    itemTextColor: "#999",
    symbolSize: 18,
    symbolShape: "circle",
    effects: [
      {
        on: "hover",
        style: {
          itemTextColor: "#000",
        },
      },
    ],
  },
]
