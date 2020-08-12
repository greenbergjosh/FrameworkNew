import { PieDatum } from "@nivo/pie"
import { OrdinalColorsInstruction } from "@nivo/colors"
import { LegendProps } from "@nivo/legends"

export function mapNivoColorScheme(colorScheme: string): OrdinalColorsInstruction<PieDatum> {
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

export type NivoPieDataType = {
  id: string
  label: string
  value: number
}

export function mapDataToNivoData(data: any[], sliceLabelKey: string, sliceValueKey: string): NivoPieDataType[] {
  if (!data.map || data.length < 1) return []
  return data.map((d, index) => {
    return { id: index.toString(), label: d[sliceLabelKey], value: d[sliceValueKey] }
  })
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
