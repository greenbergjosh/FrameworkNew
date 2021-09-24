export * from "fp-ts/lib/Option";
/**
 * useful for onLeft handler of Option.foldL()
 */
export declare function None<R>(onNone: () => R): () => R;
/**
 * useful for onSome handler of Option.fold/foldL()
 */
export declare function Some<T, R>(onSome: (value: T) => R): (v: T) => R;
//# sourceMappingURL=Option.d.ts.map