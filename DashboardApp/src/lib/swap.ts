export const swap = <T>(list: Array<T>, index1: number, index2: number): Array<T> => {
  const min = Math.min(index1, index2)
  const max = Math.max(index1, index2)

  return [
    ...list.slice(0, min),
    list[max],
    ...list.slice(min + 1, max),
    list[min],
    ...list.slice(max + 1),
  ]
}
