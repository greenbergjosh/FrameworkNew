export * from "fp-ts/lib/These"

/**
 * useful for onThis handler of These.fold()
 */
export function This<T, R>(onThis: (dis: T) => R): (dis: T) => R {
  return onThis
}
/**
 * useful for onThat handler of These.fold()
 */
export function That<T, R>(onThat: (dat: T) => R): (dat: T) => R {
  return onThat
}
/**
 * useful for onBoth handler of These.fold()
 */
export function Both<T, U, R>(onThat: (dis: T, dat: U) => R): (dis: T, dat: U) => R {
  return onThat
}
