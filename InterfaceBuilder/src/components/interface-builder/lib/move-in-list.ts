export const moveInList = <T>(list: Array<T>, originIndex: number, destinationIndex: number): Array<T> => {
  if (originIndex < destinationIndex) {
    return [
      ...list.slice(0, originIndex),
      ...list.slice(originIndex + 1, destinationIndex + 1),
      list[originIndex],
      ...list.slice(destinationIndex + 1),
    ]
  }
  return [
    ...list.slice(0, destinationIndex),
    list[originIndex],
    ...list.slice(destinationIndex, originIndex),
    ...list.slice(originIndex + 1),
  ]
}
