// TODO: [CHN-492] Optimize prop checking in Droppable --
//  When the user enters a change in the column's edit mode and we're using isEqual,
//  the props appear unchanged by value, so changes aren't merged into the model.
//  When using shallowPropCheck, nested objects appear different by identity
//  so the view is re-rendered.
export const shallowPropCheck = <T>(propsToCheck: (keyof Partial<T>)[]) => (
  prevProps: Partial<T>,
  nextProps: Partial<T>
) => {
  return propsToCheck.every((p) => prevProps[p] === nextProps[p])
}
