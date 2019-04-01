export function words(s: string): Array<string> {
  return s.split(" ")
}

export function titleize(s: string): string {
  return words(s)
    .map(([fst, ...rest]) => `${fst.toUpperCase()}${rest.join("")}`)
    .join(" ")
}
