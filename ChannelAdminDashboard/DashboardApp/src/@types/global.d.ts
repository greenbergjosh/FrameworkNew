declare type Nil = undefined | null
declare type Nilable<T> = T | null | undefined
/** From T, remove keys in K */
declare type Required<T> = T extends object ? { [P in keyof T]-?: NonNullable<T[P]> } : T
declare type DeepRequired<T, U extends object | undefined = undefined> = T extends object
  ? {
      [P in keyof T]-?: NonNullable<T[P]> extends NonNullable<U | Function | Class>
        ? NonNullable<T[P]>
        : DeepRequired<NonNullable<T[P]>, U>
    }
  : T
declare type PropsFromComponent<
  C extends React.ComponentType<any>
> = C extends React.ComponentType<infer P> ? P : never
