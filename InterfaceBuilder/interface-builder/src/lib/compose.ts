//(hocProps: T) => JSX.Element
// export type ComposableFn<T> = (Wrapper: React.ComponentType<T>) => React.ComponentType<T>
export type ComposableFn<T> = (Wrapper: T) => T

/**
 * Compose HOCs similar to Redux compose.
 * @param funcs
 */
export const compose = <T>(...funcs: ComposableFn<T>[]) =>
  funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args)),
    (arg) => arg
  )
