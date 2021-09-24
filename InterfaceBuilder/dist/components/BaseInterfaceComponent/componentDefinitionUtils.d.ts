import { ComponentDefinition } from "../../globalTypes";
/**
 * Returns a collection of the default values from each of this component's schema definitions.
 * @param componentDefinitions
 */
export declare function getDefaultsFromComponentDefinitions(componentDefinitions: ComponentDefinition[]): {};
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
export declare function hydrateDefinition(overrideDefinitions: Partial<ComponentDefinition>[], baseDefinitions: ComponentDefinition[]): ComponentDefinition[];
//# sourceMappingURL=componentDefinitionUtils.d.ts.map