import { PieDatum } from "@nivo/pie"
import { OrdinalColorsInstruction } from "@nivo/colors"
import { LegendProps } from "@nivo/legends"
import { isEmpty, toNumber } from "lodash/fp"
import { PieDatumPlus, SliceLabelValueType } from "components/interface-builder/components/chart/pie/types"
import { tryCatch } from "fp-ts/lib/Option"

export const emptyDataSet = [{ id: "None", label: "No data", value: 1 }]

export function getNivoColorScheme(colorScheme: string): OrdinalColorsInstruction<PieDatum> {
  switch (colorScheme) {
    case "set1":
      return { scheme: "nivo" }
    case "set2":
      return { scheme: "category10" }
    case "set3":
      return { scheme: "set1" }
    case "set4":
      return { scheme: "accent" }
    case "set5":
      return { scheme: "pastel1" }
    case "set6":
      return { scheme: "red_yellow_blue" }
    case "set7":
      return { scheme: "yellow_green_blue" }
    case "set8":
      return { scheme: "yellow_orange_red" }
    case "set9":
      return { scheme: "purple_blue_green" }
    default:
      return { scheme: "nivo" }
  }
}

function createSliceData({
                           id,
                           labelName,
                           labelValue,
                           value,
                           data,
                         }: {
  id: string
  labelName: string
  labelValue: string
  value: number
  data: any
}) {
  return {
    id,
    value,
    label: labelName,
    sliceLabel: labelValue,
    data,
  }
}

function getLabelValue({
                         data,
                         labelValueType,
                         labelValueKey,
                         labelValueFn,
                         valueKey,
                       }: {
  data: any
  labelValueType: SliceLabelValueType
  labelValueFn?: Function | ""
  labelValueKey: string
  valueKey: string
}): string {
  switch (labelValueType) {
    case "default":
      return data[valueKey]
    case "function":
      return labelValueFn ? tryCatch(() => labelValueFn(data)).getOrElse(data[valueKey]) : data[valueKey]
    case "key":
      return data[labelValueKey]
  }

}

function getSliceRawData({
                           data,
                           labelNameKey,
                           labelValueType,
                           labelValueKey,
                           labelValueFn,
                           valueKey,
                         }: {
  data: any
  labelNameKey: string
  labelValueType: SliceLabelValueType
  labelValueFn?: Function | ""
  labelValueKey: string
  valueKey: string
}) {
  const rawValue = toNumber(data[valueKey])
  const value = isNaN(rawValue) ? 0 : rawValue
  const labelName: string = data[labelNameKey]
  const labelValue = getLabelValue({ data, labelValueType, labelValueKey, labelValueFn, valueKey })
  return { value, labelName, labelValue }
}

/**
 * Convert API data to an array of PieDatum type.
 * @param data
 * @param labelNameKey
 * @param labelValueType
 * @param labelValueKey
 * @param labelValueFunction
 * @param valueKey
 * @param dataIsPreSorted
 * @param threshold
 * @param otherAggregatorFunction
 */
export function convertToPieDatum({
                                    data,
                                    labelNameKey,
                                    labelValueType,
                                    labelValueKey,
                                    labelValueFunction,
                                    valueKey,
                                    dataIsPreSorted,
                                    threshold,
                                    otherAggregatorFunction,
                                  }: {
  data: any[]
  labelNameKey: string
  labelValueType: SliceLabelValueType
  labelValueKey: string
  labelValueFunction?: string
  valueKey: string
  dataIsPreSorted: boolean
  threshold: number
  otherAggregatorFunction?: string
}): PieDatumPlus[] {
  // Return if nothing to do
  if (isEmpty(data)) return emptyDataSet
  if (!data.map || data.length < 1) return []

  let belowThreshold: PieDatumPlus[] = []

  // Example function: d => `${Math.floor(Number.parseFloat(d.percentage) * 100)}%`
  const parsedLabelValueFunction =
    labelValueType === "function" && labelValueFunction && tryCatch(() => new Function(`return ${labelValueFunction}`)()).toUndefined()

  // Convert to PieDatum[]
  const pieDatum = data.reduce((acc, d, index) => {
    const { value, labelName, labelValue } = getSliceRawData({
      data: d,
      labelNameKey,
      labelValueType,
      labelValueKey,
      labelValueFn: parsedLabelValueFunction,
      valueKey,
    })
    const sliceData = createSliceData({
      id: index.toString(),
      labelName,
      labelValue,
      value,
      data: d,
    })

    if (threshold > 0 && value < threshold) {
      belowThreshold.push(sliceData)
    } else {
      acc.push(sliceData)
    }
    return acc
  }, [])

  if (!dataIsPreSorted) {
    pieDatum.sort((a: { value: number }, b: { value: number }) => b.value - a.value)
  }

  // Gather values below the threshold into an "Other" PieDatum
  if (threshold > 0 && belowThreshold.length > 0) {
    const defaultOtherSlice = createSliceData({
      id: "",
      labelName: "Others",
      labelValue: "Others",
      value: 0,
      data: {},
    })

    const aggregate = belowThreshold.reduce((acc, pieDatum) => {
      acc.value += pieDatum.value
      return acc
    }, defaultOtherSlice)

    const otherAggregator = otherAggregatorFunction && tryCatch(() => new Function(`return ${otherAggregatorFunction}`)()).toUndefined()
    if (otherAggregator) {
      aggregate.data = otherAggregator(belowThreshold)
    }

    aggregate.sliceLabel = getLabelValue({
      data: aggregate.data,
      labelValueType,
      labelValueKey,
      labelValueFn: parsedLabelValueFunction,
      valueKey,
    })
    aggregate.id = (pieDatum.length + 1).toString()
    pieDatum.push(aggregate)
  }
  return pieDatum
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
