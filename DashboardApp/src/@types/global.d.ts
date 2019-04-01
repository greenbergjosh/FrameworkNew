declare type Nil = undefined | null
declare type Nilable<T> = T | null | undefined
declare type NotNil<T> = Exclude<T, Nil>
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
declare type Required<T> = T extends object ? { [P in keyof T]-?: NonNullable<T[P]> } : T
declare type DeepRequired<T, U extends object | undefined = undefined> = T extends object
  ? {
      [P in keyof T]-?: NonNullable<T[P]> extends NonNullable<U | Function | Class>
        ? NonNullable<T[P]>
        : DeepRequired<NonNullable<T[P]>, U>
    }
  : T
declare type PropsFromComponent<
  C extends React.ComponentType
> = C extends React.ComponentType<infer P> ? P : never
