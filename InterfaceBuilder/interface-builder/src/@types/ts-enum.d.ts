export interface TSEnum<T extends string | undefined> {
  [key: string]: T
}
