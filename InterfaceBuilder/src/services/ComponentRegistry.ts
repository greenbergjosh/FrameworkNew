import React from "react"
import { BaseInterfaceComponentType } from "../globalTypes"

export interface ComponentRegistry {
  cache: ComponentRegistryCache
  lookup: (key: string) => BaseInterfaceComponentType
  register: (updatedRegistry: ComponentRegistryCache) => void
}

export interface ComponentRegistryCache {
  [key: string]: BaseInterfaceComponentType
}

export const registry: ComponentRegistry = {
  cache: {},
  lookup(key: string) {
    return registry.cache[key]
  },
  /**
   * Adds third-party components to the registry
   * @param updatedRegistry
   */
  register(updatedRegistry: ComponentRegistryCache) {
    Object.entries(updatedRegistry).forEach(([key, component]) => (registry.cache[key] = component))
  },
}

export const ComponentRegistryContext = React.createContext<{
  componentRegistry: ComponentRegistry
}>({
  componentRegistry: registry,
})
