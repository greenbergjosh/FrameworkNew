export * from "fp-ts/lib/Either"

/**
 * useful for onLeft handler of Either.fold()
 */
export function Left<T, R>(onLeft: (value: T) => R): (v: T) => R {
  return onLeft
}
/**
 * useful for onRight handler of Either.fold()
 */
export function Right<T, R>(onRight: (value: T) => R): (v: T) => R {
  return onRight
}
