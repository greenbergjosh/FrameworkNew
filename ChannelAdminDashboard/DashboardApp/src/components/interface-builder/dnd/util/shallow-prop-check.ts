export const shallowPropCheck = <T>(propsToCheck: (keyof Partial<T>)[]) => (
  prevProps: Partial<T>,
  nextProps: Partial<T>
) => {
  return propsToCheck.every((p) => prevProps[p] === nextProps[p])
}
