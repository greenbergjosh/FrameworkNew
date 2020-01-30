import * as SecureStore from "expo-secure-store"

export const getgotStorage = {
  set: async (key: string, item: any, type?: keyof (typeof serializers)) =>
    await SecureStore.setItemAsync(key, serialize(item, type || typeof item), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  get: async <T = string>(
    key: string,
    type?: keyof (typeof serializers)
  ): Promise<T | undefined> => {
    const result = await SecureStore.getItemAsync(key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    })

    if (type) {
      return deserialize<T>(result, type)
    }
    return (result as unknown) as T
  },
  clear: (key: string) => SecureStore.deleteItemAsync(key),
}

const serializers = {
  bigint: {
    toString: (value: bigint) => value.toString(),
    fromString: (value: string) => BigInt(value),
  },
  boolean: {
    toString: (value: number) => String(value),
    fromString: (value: string) => (value as any) * 1,
  },
  function: {
    toString: (value: () => {}) => value.toString(),
    fromString: (value: string) => new Function("return " + value)(),
  },
  number: {
    toString: (value: number) => String(value),
    fromString: (value: string) => (value as any) * 1,
  },
  object: {
    toString: (value: object) => JSON.stringify(value),
    fromString: (value: string) => JSON.parse(value),
  },
  string: {
    toString: (value: string) => String(value),
    fromString: (value: string) => value,
  },
  symbol: {
    toString: (value: symbol) => Symbol.keyFor(value),
    fromString: (value: string) => Symbol.for(value),
  },
  undefined: {
    toString: (value: undefined) => "undefined",
    fromString: (value: string) => void 0,
  },
}

const serialize = (item: any, type?: keyof (typeof serializers)): string =>
  serializers[type] ? serializers[type].toString(item) : String(item)

const deserialize = <T>(item: any, type?: keyof (typeof serializers)): T =>
  serializers[type] ? serializers[type].fromString(item) : item
