import { PieDatum } from "@nivo/pie"
import { OrdinalColorsInstruction } from "@nivo/colors"
import { LegendProps } from "@nivo/legends"
import { isEmpty, toNumber } from "lodash/fp"

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

/**
 * Convert API data to an array of PieDatum type.
 * @param data
 * @param labelKey
 * @param valueKey
 * @param threshold
 */
export function convertToPieDatum(data: any[], labelKey: string, valueKey: string, threshold: number): PieDatum[] {
  // Return if nothing to do
  if (isEmpty(data)) return emptyDataSet
  if (!data.map || data.length < 1) return []

  let belowThreshold: PieDatum[] = []

  // Convert to PieDatum[]
  const pieDatum = data.reduce((acc, d, index) => {
    const rawValue = toNumber(d[valueKey])
    const value = isNaN(rawValue) ? 0 : rawValue
    const label = d[labelKey]

    if (threshold > 0 && value < threshold) {
      belowThreshold.push({ id: index.toString(), label, value })
    } else {
      acc.push({ id: index.toString(), label, value })
    }
    return acc
  }, [])

  // Gather values below the threshold into an "Other" PieDatum
  if (threshold > 0 && belowThreshold.length > 0) {
    const aggregate = belowThreshold.reduce(
      (acc, pieDatum, index) => {
        acc.value += pieDatum.value
        // acc.label += `, ${pieDatum.label}`
        return acc
      },
      { id: "", value: 0, label: "Others" }
    )

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
