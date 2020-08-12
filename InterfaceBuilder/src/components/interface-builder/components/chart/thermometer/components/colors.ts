export default function getColor(colorName: string): string {
  // @ts-ignore
  return colors[colorName]
}

export const colors = {
  black: "black",
  lightgrey: "lightgrey",
  grey: "grey",
  lightblue: "rgb(166, 206, 227)",
  blue: "rgb(31, 120, 180)",
  lightgreen: "rgb(178, 223, 138)",
  green: "rgb(51, 160, 44)",
  lightred: "rgb(251, 154, 153)",
  red: "rgb(227, 26, 28)",
  lightorange: "rgb(253, 191, 111)",
  orange: "rgb(255, 127, 0)",
  lightpurple: "rgb(202, 178, 214)",
  purple: "rgb(106, 61, 154)",
  lightyellow: "rgb(255, 255, 153)",
  brown: "rgb(177, 89, 40)",
}
