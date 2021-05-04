import { ComponentDefinition } from "../../globalTypes"
import { merge, mergeWith } from "lodash/fp"
import { registry } from "../../services/ComponentRegistry"

/**
 * Returns a collection of the default values from each of this component's schema definitions.
 * @param componentDefinitions
 */
export function getDefaultsFromComponentDefinitions(componentDefinitions: ComponentDefinition[]) {
  // Iterate over all the definitions to accumulate their defaults
  return componentDefinitions.reduce((acc, componentDefinition) => {
    // If there are child lists of in the component's definitions
    const nestedValues: { [key: string]: any } = Object.entries(componentDefinition).reduce((acc2, [key, value]) => {
      if (Array.isArray(value) && value.length && value[0].component) {
        // Merge in child list values if they exist
        return merge(getDefaultsFromComponentDefinitions(value), acc2)
      }

      return acc2
    }, {})

    // Check to see if there's a component type for this object
    const Component = registry.lookup(componentDefinition.component)

    // If this component has a value itself, get it
    const thisValue = (Component && Component.getDefinitionDefaultValue(componentDefinition)) || {}

    // Combine the existing values with this level's value and any nested values
    return merge(nestedValues, merge(thisValue, acc))
  }, {})
}

/**
 * Overrides base definitions with a component's definitions.
 *
 * ---- Example ----
 * baseDefinitions: [
 *   { "key": "hideLabel", },
 *   { "key": "label", },
 *   { "key": "valueKey", }
 * ]
 * overrideDefinitions: [
 *   { "key": "label", },
 *   { "key": "valueKey", },
 *   { "key": "orientation", }
 * ]
 * hydratedDefinitions: [
 *   { "key": "hideLabel", },
 *   { "key": "label", },
 *   { "key": "valueKey", }
 *   { "key": "orientation", }
 * ]
 *
 * @param overrideDefinitions
 * @param baseDefinitions
 */
export function hydrateDefinition(
  overrideDefinitions: Partial<ComponentDefinition>[],
  baseDefinitions: ComponentDefinition[]
): ComponentDefinition[] {
  if (Array.isArray(overrideDefinitions) && overrideDefinitions.length > 0) {
    const hydratedDefinitions = recursiveMerge(overrideDefinitions, baseDefinitions)
    return hydratedDefinitions
  }
  return baseDefinitions
}

/**
 *
 * @param overrideDefinitions
 * @param baseDefinitions
 */
function recursiveMerge(
  overrideDefinitions: Partial<ComponentDefinition>[] | undefined,
  baseDefinitions: ComponentDefinition[]
): ComponentDefinition[] {
  /* Merge overrideDefinitions that are arrays (e.g., "components", "tabs", etc). */
  if (!Array.isArray(overrideDefinitions) || overrideDefinitions.length < 1) {
    return baseDefinitions
  }

  const mutableUnmatchedOverrideDefinitions: Partial<ComponentDefinition>[] = [...overrideDefinitions!]
  const accumulator: ComponentDefinition[] = []

  /* Find matches and override base definition */
  const overridden: ComponentDefinition[] = baseDefinitions.reduce(
    (acc, baseDefinition) => mergeReducer(baseDefinition, mutableUnmatchedOverrideDefinitions, acc),
    accumulator
  )

  /* Unmatched override definitions must be complete ComponentDefinitions (not partial). */
  const unmatched = convertPartialDefinitionsToFull(mutableUnmatchedOverrideDefinitions)
  return overridden.concat(unmatched)
}

/**
 *
 * @param baseDefinition
 * @param mutableUnmatchedOverrideDefinitions
 * @param acc
 */
function mergeReducer(
  baseDefinition: ComponentDefinition,
  mutableUnmatchedOverrideDefinitions: Partial<ComponentDefinition>[],
  acc: ComponentDefinition[]
): ComponentDefinition[] {
  const idx = getDefinitionIndexByKey(mutableUnmatchedOverrideDefinitions, baseDefinition.key)
  if (idx > -1) {
    /* Found the override definition, so override the base definition. */
    const overrideDefinition = mutableUnmatchedOverrideDefinitions.splice(idx, 1)[0]
    const overridden = mergeWith(
      (override, base) => {
        if (Array.isArray(override) && Array.isArray(base)) {
          return recursiveMerge(override, base)
        }
        // We only need to return the override value,
        // because otherwise, mergeWith() will take the base value.
        if (typeof override !== "undefined") {
          return override
        }
      },
      overrideDefinition,
      baseDefinition
    )

    acc.push(overridden)
    return acc
  }

  /* No definition override, so just add the base definition as a default value. */
  acc.push(baseDefinition)
  return acc
}

function getDefinitionIndexByKey(definitions: Partial<ComponentDefinition>[], key: string): number {
  return definitions.findIndex((def) => !!def.key && def.key === key)
}

function convertPartialDefinitionsToFull(
  unmatchedOverrideDefinitons: Partial<ComponentDefinition>[]
): ComponentDefinition[] {
  // TODO: ensure that each unmatchedOverrideDefinition is a valid ComponentDefinition (has "key" and "component").
  return unmatchedOverrideDefinitons as ComponentDefinition[]
}
