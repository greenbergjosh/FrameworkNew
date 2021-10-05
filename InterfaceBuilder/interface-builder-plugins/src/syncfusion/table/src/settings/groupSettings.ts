import { SortableGroupableColumnModel } from "types"
import { ActionEventArgs, GroupSettingsModel } from "@syncfusion/ej2-react-grids"
import { get, isArray, isEmpty, sortBy, isString } from "lodash/fp"

export type EncodedGroupBy = string | string[] | null

/**
 *
 * @param columns
 * @param encodedGroupBy
 * @return GroupSettingsModel
 */
export function getGroupSettings(
  columns: SortableGroupableColumnModel[],
  encodedGroupBy: EncodedGroupBy
): GroupSettingsModel {
  /* Get groups */
  const decodedGroups = decodeGroups(encodedGroupBy)
  if (decodedGroups) {
    return decodedGroups
  }

  /* Otherwise, return default groups if any */
  const orderedColumns = sortBy("groupOrder", columns)
  const filteredColumns = orderedColumns.reduce((acc, column) => {
    if (column.field && typeof column.groupOrder !== "undefined") {
      acc.push(column.field)
    }
    return acc
  }, [] as string[])

  return {
    columns: filteredColumns,
  }
}

/* *****************************************************************************
 *
 * DECODING
 */

/**
 *
 * @param encoded
 * @returns { columns[] }
 */
export function decodeGroups(encoded: EncodedGroupBy): Partial<GroupSettingsModel> | undefined {
  if (isArray(encoded)) {
    const encodedGroups = encoded as string[]
    return { columns: encodedGroups }
  }
  /*
   * When there is only one encoded group,
   * it is a string instead of an array
   */
  if (encoded) {
    const columns = parseGroups(encoded)
    if (columns) {
      return { columns }
    }
  }
}

/**
 *
 * @param encodedValues
 * @returns string[] columns
 */
function parseGroups(encodedValues: string): string[] | undefined {
  if (!encodedValues || isEmpty(encodedValues)) {
    return
  }
  return encodedValues.split("~")
}

/* *****************************************************************************
 *
 * ENCODING
 */

/**
 *
 * @param arg
 * @param prevGroups
 * @return string[] columns
 */
export function encodeGroups(arg: ActionEventArgs, prevGroups: EncodedGroupBy): EncodedGroupBy {
  const fieldName = arg.columnName

  /* Nothing to do */
  if (!fieldName || isEmpty(fieldName)) {
    return prevGroups
  }

  /* Remove Group */
  if (arg.requestType === "ungrouping") {
    if (!prevGroups) {
      return []
    }
    if (isString(prevGroups)) {
      // Previous groups is a string, so remove the group
      return prevGroups.startsWith(fieldName) ? null : prevGroups
    }
    if (isArray(prevGroups)) {
      // Find the group and remove it
      const delIndex = prevGroups.findIndex((item) => item.startsWith(fieldName))
      if (delIndex > -1) {
        const nextGroups = [...prevGroups]
        nextGroups.splice(delIndex, 1)
        return nextGroups
      }
    }
  }

  /* Update Group */
  const newGroup = stringifyGroup(arg)
  if (newGroup && !isEmpty(newGroup)) {
    if (!prevGroups || prevGroups.length < 1) {
      return newGroup
    }
    if (prevGroups && isString(prevGroups)) {
      // prevGroups is a string (not an array), so add/update string and return an array
      return prevGroups.startsWith(fieldName) ? newGroup : [prevGroups, newGroup]
    }
    if (isArray(prevGroups)) {
      // Add or update groups
      const indexToUpdate = prevGroups.findIndex((item) => item.startsWith(fieldName))
      const nextGroups = [...prevGroups]
      if (indexToUpdate > -1) {
        nextGroups[indexToUpdate] = newGroup
      } else {
        nextGroups.push(newGroup)
      }
      return nextGroups
    }
  }

  // Give up and return the original groups
  return prevGroups
}

/**
 *
 * @param arg
 * @return string column
 */
export function stringifyGroup(arg: ActionEventArgs): string | undefined {
  return arg.columnName
}
