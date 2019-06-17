export const shallowPropCheck = <T>(propsToCheck: (keyof T)[]) => (prevProps: T, nextProps: T) => {
  return propsToCheck.every((p) => prevProps[p] === nextProps[p])
}
