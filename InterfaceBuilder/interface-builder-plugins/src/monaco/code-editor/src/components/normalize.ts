import { isEmpty } from "lodash/fp"
import { UserInterfaceDataType } from "@opg/interface-builder"

export function normalize(data: UserInterfaceDataType): UserInterfaceDataType {
  if (isEmpty(data)) {
    return null
  }
  return data
}
