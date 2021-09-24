import React from "react";
import { BaseInterfaceComponentType } from "./components/base/BaseInterfaceComponent";
export interface ComponentRegistry {
    cache: ComponentRegistryCache;
    lookup: (key: string) => BaseInterfaceComponentType;
    register: (updatedRegistry: ComponentRegistryCache) => void;
}
export interface ComponentRegistryCache {
    [key: string]: BaseInterfaceComponentType;
}
export declare const registry: ComponentRegistry;
export declare const ComponentRegistryContext: React.Context<{
    componentRegistry: ComponentRegistry;
}>;
//# sourceMappingURL=registry.d.ts.map