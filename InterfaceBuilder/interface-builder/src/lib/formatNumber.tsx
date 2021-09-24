export function formatNumber(num: number): string | null {
  if (!num) return null
  if (isNaN(num)) return `${num}`
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}
