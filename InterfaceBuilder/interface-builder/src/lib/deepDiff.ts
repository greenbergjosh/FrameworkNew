export function deepDiff(
  oldVal: any,
  newVal: any,
  ignoreProp: (key: string, oldValue: any, newValue: any) => boolean = defaultIgnoreProp
) {
  // Check simple primitives
  if (!oldVal || !newVal || typeof oldVal !== "object" || typeof newVal !== "object") {
    if (oldVal !== newVal) {
      // If they're not the same
      return { previous: oldVal, next: newVal }
    }
    // If they are the same
    return null
  }

  // Both must be objects, so we need to accumulate their keys
  const keys = [...new Set(Object.keys(oldVal).concat(Object.keys(newVal)))]

  // If there are no changes anywhere down in the object, report null for the whole object
  let foundNonNull = false

  // Iterate over the keys, collecting changes
  const result = keys.reduce((acc, key) => {
    // Old and new values of prop
    const o = oldVal[key]
    const n = newVal[key]

    // If the objects are not the same reference
    if (o !== n && !ignoreProp(key, o, n)) {
      const d = deepDiff(o, n, ignoreProp)
      foundNonNull = foundNonNull || !!d
      if (d) {
        acc[key] = d
      }
    }

    return acc
  }, {} as { [key: string]: any })

  return foundNonNull ? result : null
}

function defaultIgnoreProp(key: string, newVal: any, oldVal: any): boolean {
  return false
}
