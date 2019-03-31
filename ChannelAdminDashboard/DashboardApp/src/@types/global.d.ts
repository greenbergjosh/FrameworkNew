declare type Nil = undefined | null
declare type Nilable<T> = T | null | undefined
declare type NotNil<T> = Exclude<T, Nil>
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
