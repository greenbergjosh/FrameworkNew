export * from "fp-ts/lib/Option"

/**
 * useful for onLeft handler of Option.foldL()
 */
export function None<R>(onNone: () => R): () => R {
  return onNone
}
/**
 * useful for onSome handler of Option.fold/foldL()
 */
export function Some<T, R>(onSome: (value: T) => R): (v: T) => R {
  return onSome
}
