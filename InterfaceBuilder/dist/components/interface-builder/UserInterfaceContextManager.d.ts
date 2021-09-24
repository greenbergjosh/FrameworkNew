import React from "react";
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString";
export interface UserInterfaceContextManager<T = any> {
    loadByFilter: (predicate: (item: T) => boolean) => T[];
    loadById: (id: NonEmptyString) => T | null;
    loadByURL: (url: string) => unknown[];
}
export declare const UserInterfaceContext: React.Context<UserInterfaceContextManager<any> | null>;
//# sourceMappingURL=UserInterfaceContextManager.d.ts.map