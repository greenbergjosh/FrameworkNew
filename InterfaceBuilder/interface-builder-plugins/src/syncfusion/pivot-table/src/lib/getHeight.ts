export function getHeight(heightKey: string, height: number): string | number {
  switch (heightKey) {
    case "auto":
      return 0
    case "full":
      return 999999999
    case "fieldlist":
      return 629
    case "value":
      if (height > 0) {
        return height
      }
  }
  return "auto"
}
