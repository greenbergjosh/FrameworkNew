export default function getColor(colorName: string, opacity: number = 1): string {
  // @ts-ignore
  return `rgb(${colors[colorName]}, ${opacity})`
}

const colors = {
  black: "0, 0, 0",
  lightgrey: "192, 192, 192",
  grey: "128, 128, 128",
  lightblue: "166, 206, 227",
  blue: "31, 120, 180",
  lightgreen: "178, 223, 138",
  green: "51, 160, 44",
  pink: "251, 154, 153",
  red: "227, 26, 28",
  lightorange: "253, 191, 111",
  orange: "255, 127, 0",
  violet: "202, 178, 214",
  purple: "106, 61, 154",
  lightyellow: "255, 255, 153",
  brown: "177, 89, 40",
}

export const colorOptions = [
  {
    label: "Light Grey",
    value: "lightgrey",
  },
  {
    label: "Grey",
    value: "grey",
  },
  {
    label: "Black",
    value: "black",
  },
  {
    label: "Light Blue",
    value: "lightblue",
  },
  {
    label: "Blue",
    value: "blue",
  },
  {
    label: "Light Green",
    value: "lightgreen",
  },
  {
    label: "Green",
    value: "green",
  },
  {
    label: "Light Red",
    value: "pink",
  },
  {
    label: "Red",
    value: "red",
  },
  {
    label: "Light Orange",
    value: "lightorange",
  },
  {
    label: "Orange",
    value: "orange",
  },
  {
    label: "Light Purple",
    value: "violet",
  },
  {
    label: "Purple",
    value: "purple",
  },
  {
    label: "Light Yellow",
    value: "lightyellow",
  },
  {
    label: "Brown",
    value: "brown",
  },
]
