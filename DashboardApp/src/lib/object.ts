// eslint-disable-next-line @typescript-eslint/ban-types
export function keys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>
}
