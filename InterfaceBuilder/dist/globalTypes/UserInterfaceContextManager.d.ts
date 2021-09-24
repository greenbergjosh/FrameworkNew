import { NonEmptyString } from "io-ts-types/lib/NonEmptyString";
/**
 * UserInterfaceContextManager
 */
export interface UserInterfaceContextManager<T = any> {
    loadByFilter: (predicate: (item: T) => boolean) => T[];
    loadById: (id: NonEmptyString) => T | null;
    loadByURL: (url: string) => unknown[];
}
//# sourceMappingURL=UserInterfaceContextManager.d.ts.map