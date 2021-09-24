export * from "fp-ts/lib/Either";
/**
 * useful for onLeft handler of Either.fold()
 */
export declare function Left<T, R>(onLeft: (value: T) => R): (v: T) => R;
/**
 * useful for onRight handler of Either.fold()
 */
export declare function Right<T, R>(onRight: (value: T) => R): (v: T) => R;
//# sourceMappingURL=Either.d.ts.map