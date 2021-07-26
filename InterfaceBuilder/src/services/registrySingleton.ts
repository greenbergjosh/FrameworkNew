import { registry, ComponentRegistry } from "./ComponentRegistry"
import { withEvents } from "components/withEvents/withEvents"

registry._withEvents = withEvents

/**
 * This singleton was necessary to break a circular dependency:
 * BaseInterfaceComponent
 *   -> componentDefinitionUtils
 *     -> ComponentRegistry
 *       -> withEvents
 *         -> BaseInterfaceComponent
 */
export function getRegistry(): ComponentRegistry {
  return registry
}
