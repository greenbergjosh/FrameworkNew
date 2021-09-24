import React from "react"
import {
  AbstractBaseInterfaceComponentType,
  BaseInterfaceComponentProps,
} from "../components/BaseInterfaceComponent/types"
import { DefaultComponent, DefaultImportedComponent, lazy, LoadableComponent } from "@loadable/component"

export type ImportFactory = (
  props: BaseInterfaceComponentProps
) => Promise<DefaultImportedComponent<BaseInterfaceComponentProps>>

// export type LoadedComponent = Promise<React.ComponentType<BaseInterfaceComponentProps>>
export type LoadedComponent = Promise<AbstractBaseInterfaceComponentType>

// export type RegisterableComponents = {
//   [key: string]: ImportFactory | React.ComponentType<BaseInterfaceComponentProps>
// }

export type RegisterableComponent = {
  component: React.ComponentType<any> | ImportFactory
  layoutDefinition: Record<string, unknown>
}

export type CachedComponent = {
  component: LoadableComponent<BaseInterfaceComponentProps> | LoadedComponent
  layoutDefinition: Record<string, unknown>
}

export interface ComponentRegistryCache {
  [key: string]: CachedComponent
}

/*
 Argument of type '{ "bulk-text-input": typeof BulkTextInputInterfaceComponent; button: typeof ButtonInterfaceComponent; card: typeof CardInterfaceComponent; ... 50 more ...; table: ImportFactory; }' is not assignable to parameter of type 'ComponentDefinition & ComponentRenderMetaProps'.
 */

export interface ComponentRegistry {
  _cache: ComponentRegistryCache
  lookup: (key: string) => LoadedComponent
  register: (componentPackages: { [key: string]: RegisterableComponent }) => void
  _withEvents: (component: AbstractBaseInterfaceComponentType) => AbstractBaseInterfaceComponentType
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
  _cache: {},

  _withEvents: (c) => c,

  lookup(key) {
    const cachedComponentPkg = registry._cache[key]

    if (cachedComponentPkg && isLoadableComponent(cachedComponentPkg.component)) {
      const loaded = (cachedComponentPkg.component as LoadableComponent<BaseInterfaceComponentProps>).load()
      const loadedWithEvents: LoadedComponent = loaded.then((c: DefaultComponent<BaseInterfaceComponentProps>) => {
        const component: React.ComponentType<BaseInterfaceComponentProps> = (c as any).default
          ? (c as DefaultImportedComponent<BaseInterfaceComponentProps>).default
          : (c as React.ComponentType<BaseInterfaceComponentProps>)

        if (isBaseInterfaceComponent(component)) {
          // Item is AbstractBaseInterfaceComponentType
          const validBaseInterfaceComponent = component as unknown as AbstractBaseInterfaceComponentType
          const componentWithEvents = registry._withEvents(validBaseInterfaceComponent)
          registry._cache[key] = { ...cachedComponentPkg, component: Promise.resolve(componentWithEvents) }
          return componentWithEvents
        }
        console.error(`${key} is not a valid component`, { loaded, loadedWithEvents, component })
        return Promise.reject(`${key} is not a valid component`)
      })
      return loadedWithEvents
    }

    return cachedComponentPkg ? (cachedComponentPkg.component as LoadedComponent) : Promise.reject("Config not found")
  },

  /**
   * Adds third-party components to the registry
   * @param componentPkgs
   */
  register(componentPkgs) {
    Object.entries(componentPkgs).forEach(([key, componentPkg]) => {
      if (isBaseInterfaceComponent(componentPkg.component)) {
        // Item is AbstractBaseInterfaceComponentType
        const validBaseInterfaceComponent = componentPkg.component as unknown as AbstractBaseInterfaceComponentType
        const componentWithEvents = registry._withEvents(validBaseInterfaceComponent)
        registry._cache[key] = { ...componentPkg, component: Promise.resolve(componentWithEvents) }
      } else {
        // Item is hopefully an ImportFactory
        const hopefullyImportFactory = componentPkg.component as unknown as ImportFactory
        registry._cache[key] = {
          ...componentPkg,
          component: lazy<BaseInterfaceComponentProps>(hopefullyImportFactory),
        }
      }
    })
  },
}

export const ComponentRegistryContext = React.createContext<{
  componentRegistry: ComponentRegistry
}>({
  componentRegistry: registry,
})

function isBaseInterfaceComponent(component: unknown) {
  return (
    component && typeof (component as unknown as AbstractBaseInterfaceComponentType).getLayoutDefinition === "function"
  )
}

function isLoadableComponent(item: unknown): boolean {
  return (
    !!item &&
    typeof (item as unknown as LoadableComponent<any>).load === "function" &&
    typeof (item as unknown as LoadableComponent<any>).preload === "function"
  )
}
