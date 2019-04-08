declare type Nil = undefined | null
declare type Nilable<T> = T | null | undefined
declare type PropsFromComponent<
  C extends React.ComponentType<any>
> = C extends React.ComponentType<infer P> ? P : never

/** Make keys in K required in T */
declare type Require<T extends object, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
  Required<Pick<T, K>>
