function ObjectIs(x: unknown, y: unknown): boolean {
  return x === y ? x !== 0 || 1 / (x as number) === 1 / (y as number) : x !== x && y !== y
}

export function isPOJO(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== "object" || obj === null) return false
  const proto = Object.getPrototypeOf(obj)
  return proto === Object.prototype || proto === null
}

export function isShallowEqual(a: unknown, b: unknown): boolean {
  if ((isPOJO(a) && isPOJO(b)) || (Array.isArray(a) && Array.isArray(b))) {
    if (ObjectIs(a, b)) return true
    if (Object.keys(a).length !== Object.keys(b).length) return false
    for (const k in a) if (!ObjectIs(a[k], b[k])) return false
    return true
  }

  return ObjectIs(a, b)
}