import React from "react"
import { BaseInterfaceComponentType } from "../globalTypes"

export interface ComponentRegistry {
  cache: ComponentRegistryCache
  lookup: (key: string) => BaseInterfaceComponentType
  register: (updatedRegistry: ComponentRegistryCache) => void
  _withEvents: (component: BaseInterfaceComponentType) => BaseInterfaceComponentType
}

export interface ComponentRegistryCache {
  [key: string]: BaseInterfaceComponentType
}

/**
 * NOTE: Clients should use getRegistry (from registrySingleton.ts)
 * This singleton was necessary to break a circular dependency:
 * BaseInterfaceComponent
 *   -> componentDefinitionUtils
 *     -> ComponentRegistry
 *       -> withEvents
 *         -> BaseInterfaceComponent
 */
export const registry: ComponentRegistry = {
  cache: {},
  _withEvents: (c) => c,
  lookup(key: string) {
    return registry.cache[key]
  },
  /**
   * Adds third-party components to the registry
   * @param updatedRegistry
   */
  register(updatedRegistry: ComponentRegistryCache) {
    Object.entries(updatedRegistry).forEach(
      ([key, component]) => (registry.cache[key] = registry._withEvents(component))
    )
  },
}

export const ComponentRegistryContext = React.createContext<{
  componentRegistry: ComponentRegistry
}>({
  componentRegistry: registry,
})
