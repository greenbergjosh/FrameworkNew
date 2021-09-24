import React from "react";
import { BaseInterfaceComponentType } from "../globalTypes";
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
//# sourceMappingURL=ComponentRegistry.d.ts.map