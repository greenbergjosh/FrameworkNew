import { OrdinalColorsInstruction } from "@nivo/colors"

export function getNivoColorScheme<T>(colorScheme: string): OrdinalColorsInstruction<T> {
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

export const nivoColorConfigOptions = [
  {
    label: "Default",
    value: "set1",
  },
  {
    label: "Bold 1",
    value: "set2",
  },
  {
    label: "Bold 2",
    value: "set3",
  },
  {
    label: "Accent",
    value: "set4",
  },
  {
    label: "Pastel",
    value: "set5",
  },
  {
    label: "Red, Yellow, Blue",
    value: "set6",
  },
  {
    label: "Yellow, Green, Blue",
    value: "set7",
  },
  {
    label: "Yellow, Orange, Red",
    value: "set8",
  },
  {
    label: "Purple, Blue, Green",
    value: "set9",
  },
]
