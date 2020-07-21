import { AdminUserInterfaceContextManager } from "../../../../data/AdminUserInterfaceContextManager.type"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"

/**
 *
 * @param loadById - Takes a config id of type PersistedConfig["id"]
 * @param remoteConfigId
 */
export function loadRemoteLBM(
  loadById: AdminUserInterfaceContextManager["loadById"],
  remoteConfigId?: NonEmptyString
): string | undefined {
  const remoteFunctionSrc = remoteConfigId && loadById(remoteConfigId)
  if (remoteFunctionSrc) {
    const { code } = tryCatch(() => JSON5.parse(remoteFunctionSrc.config.getOrElse(""))).toUndefined()

    return code
  }
}
