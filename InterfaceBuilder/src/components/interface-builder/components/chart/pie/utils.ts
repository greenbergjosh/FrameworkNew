import { PieDatum } from "@nivo/pie"
import { OrdinalColorsInstruction } from "@nivo/colors"
import { LegendProps } from "@nivo/legends"
import { isEmpty, toNumber } from "lodash/fp"
import { PieDatumPlus } from "components/interface-builder/components/chart/pie/types"
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
  labelNameKey,
  labelValue,
  labelValueKey,
  value,
  valueKey,
}: {
  id: string
  labelName: string
  labelNameKey: string
  labelValue: string
  labelValueKey: string
  value: number
  valueKey: string
}) {
  return {
    id,
    value,
    label: labelValue,
    [labelNameKey]: labelName,
    [valueKey]: value,
    [labelValueKey]: labelValue,
  }
}

function getSliceRawData({
  data,
  labelNameKey,
  labelValueFn,
  labelValueKey,
  valueKey,
}: {
  data: any
  labelNameKey: string
  labelValueFn?: Function | ""
  labelValueKey: string
  valueKey: string
}) {
  const rawValue = toNumber(data[valueKey])
  const value = isNaN(rawValue) ? 0 : rawValue
  const labelName = data[labelNameKey]
  const labelRawValue = data[labelValueKey]
  const labelValue = labelValueFn ? tryCatch(() => labelValueFn(labelRawValue)).getOrElse(labelRawValue) : labelRawValue
  return { value, labelName, labelValue }
}

/**
 * Convert API data to an array of PieDatum type.
 * @param data
 * @param labelNameKey
 * @param labelValueKey
 * @param labelValueFunction
 * @param valueKey
 * @param threshold
 */
export function convertToPieDatum({
  data,
  labelNameKey,
  labelValueFunction,
  labelValueKey,
  threshold,
  valueKey,
}: {
  data: any[]
  labelNameKey: string
  labelValueFunction?: string
  labelValueKey: string
  threshold: number
  valueKey: string
}): PieDatumPlus[] {
  // Return if nothing to do
  if (isEmpty(data)) return emptyDataSet
  if (!data.map || data.length < 1) return []

  let belowThreshold: PieDatumPlus[] = []

  // Example function: d => `${Math.floor(Number.parseFloat(d.percentage) * 100)}%`
  const parsedLabelValueFunction =
    labelValueFunction && tryCatch(() => new Function(`return ${labelValueFunction}`)()).toUndefined()

  // Convert to PieDatum[]
  const pieDatum = data.reduce((acc, d, index) => {
    const { value, labelName, labelValue } = getSliceRawData({
      data: d,
      labelNameKey,
      labelValueFn: parsedLabelValueFunction,
      labelValueKey,
      valueKey,
    })
    const sliceData = createSliceData({
      id: index.toString(),
      labelName,
      labelNameKey,
      labelValue,
      labelValueKey,
      value,
      valueKey,
    })

    if (threshold > 0 && value < threshold) {
      belowThreshold.push(sliceData)
    } else {
      acc.push(sliceData)
    }
    return acc
  }, [])

  // Gather values below the threshold into an "Other" PieDatum
  if (threshold > 0 && belowThreshold.length > 0) {
    const defaultOtherSlice = createSliceData({
      id: "",
      labelName: "Others",
      labelNameKey,
      labelValue: "",
      labelValueKey,
      value: 0,
      valueKey,
    })
    const aggregate = belowThreshold.reduce((acc, pieDatum, index) => {
      acc.value += pieDatum.value
      // acc.label += `, ${pieDatum.label}`
      return acc
    }, defaultOtherSlice)

    aggregate.id = pieDatum.length.toString()
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
