export function getHeight(heightKey: string, height: number): string {
  switch (heightKey) {
    case "auto":
      return "auto"
    case "full":
      return "100%"
    case "fieldlist":
      return "629px"
    case "value":
      if (height > 0) {
        return `${height}px`
      }
  }
  return "auto"
}
