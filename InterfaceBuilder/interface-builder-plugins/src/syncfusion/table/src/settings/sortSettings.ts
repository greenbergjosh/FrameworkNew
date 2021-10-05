import { SortableGroupableColumnModel } from "types"
import { ActionEventArgs, SortDescriptorModel, SortSettingsModel } from "@syncfusion/ej2-react-grids"
import { isArray, isEmpty, isString, sortBy } from "lodash/fp"

/* String or string[] with format: `${field}~${direction}` */
export type EncodedOrderBy = string | string[] | null

/**
 *
 * @param columns
 * @param encodedOrderBy
 * @return SortSettingsModel
 */
export function getSortSettings(
  columns: SortableGroupableColumnModel[],
  encodedOrderBy?: EncodedOrderBy
): SortSettingsModel | undefined {
  const decodedSorting = decodeSorting(encodedOrderBy)
  const orderedColumns = sortBy("sortOrder", columns)
  const sortDescriptors = orderedColumns.reduce<SortDescriptorModel[]>(
    (acc, column) => {
      if (column.sortDirection && column.field) {
        const sortDescriptor: SortDescriptorModel = {
          field: column.field,
          direction: column.sortDirection,
        }
        acc.push(sortDescriptor)
      }
      return acc
    },
    [...decodedSorting]
  )

  if (sortDescriptors.length > 0) {
    return { allowUnsort: true, columns: sortDescriptors }
  }
}

/* *****************************************************************************
 *
 * DECODING
 */

/**
 *
 * @param encoded
 * @returns { field, direction, isFromGroup }[]
 */
export function decodeSorting(encoded?: EncodedOrderBy): SortDescriptorModel[] {
  if (isArray(encoded)) {
    const encodedSorts = encoded as string[]
    const sorts = encodedSorts.reduce<Partial<SortDescriptorModel>[]>((acc, item) => {
      const predicate = parseSort(item)
      acc.push(predicate)
      return acc
    }, [])
    console.log({ sortSettings: sorts })
    return sorts
  }
  /*
   * When there is only one encoded sort,
   * it is a string instead of an array
   */
  if (!isEmpty(encoded)) {
    return [parseSort(encoded as string | undefined)]
  }
  return []
}

/**
 *
 * @param encodedValues
 * @returns { field, direction, isFromGroup }
 */
function parseSort(encodedValues?: string): Partial<SortDescriptorModel> {
  if (!encodedValues || isEmpty(encodedValues)) {
    return {}
  }
  const parts = encodedValues.split("~")
  const direction = abbrToDirection(parts[1])
  const isFromGroup = parts[2] ? JSON.parse(parts[2]) : false
  return {
    field: parts[0],
    direction,
    isFromGroup,
  }
}

/* *****************************************************************************
 *
 * ENCODING
 */

/**
 *
 * @param arg - { requestType, direction, columnName }
 * @param prevSorts
 * @return EncodedOrderBy - String or string[] with format: `${field}~${direction}`
 */
export function encodeSorts(arg: ActionEventArgs, prevSorts: EncodedOrderBy): EncodedOrderBy {
  const fieldName = arg.columnName

  /* Nothing to do */
  if (!fieldName || isEmpty(fieldName)) {
    //return prevSorts
    return null
  }

  /* Remove Sort */
  if (arg.action === "clearSort") {
    if (!prevSorts) {
      return []
    }
    if (isString(prevSorts)) {
      // Previous sorts is a string, so remove the sort and return an array
      return prevSorts.startsWith(fieldName) ? null : prevSorts
    }
    if (isArray(prevSorts)) {
      // Find the sort and remove it
      const delIndex = prevSorts.findIndex((item) => item.startsWith(fieldName))
      if (delIndex > -1) {
        const nextSorts = [...prevSorts]
        nextSorts.splice(delIndex, 1)
        return nextSorts
      }
    }
  }

  /* Update Sort */
  const newSort = stringifySort(arg)
  if (newSort && !isEmpty(newSort)) {
    if (!prevSorts || prevSorts.length < 1) {
      return newSort
    }
    if (prevSorts && isString(prevSorts)) {
      // prevSorts is a string (not an array), so add/update string and return an array
      return prevSorts.startsWith(fieldName) ? newSort : [prevSorts, newSort]
    }
    if (isArray(prevSorts)) {
      // Add or update sorts
      const indexToUpdate = prevSorts.findIndex((item) => item.startsWith(fieldName))
      const nextSorts = [...prevSorts]
      if (indexToUpdate > -1) {
        nextSorts[indexToUpdate] = newSort
      } else {
        nextSorts.push(newSort)
      }
      return nextSorts
    }
  }

  // Give up and return the original sorts
  return prevSorts
}

/**
 *
 * @param arg - { requestType, direction, columnName }
 * @return string - String with format: `${field}~${direction}`
 */
export function stringifySort(arg: ActionEventArgs): string | undefined {
  if (arg.requestType === "sorting" && arg.direction) {
    const direction = directionToAbbr(arg.direction)
    if (direction) {
      return `${arg.columnName}~${direction}`
    }
  }
}

function abbrToDirection(direction?: string): "Ascending" | "Descending" | undefined {
  switch (direction) {
    case "asc":
      return "Ascending"
    case "desc":
      return "Descending"
    default:
      return undefined
  }
}

function directionToAbbr(direction?: "Ascending" | "Descending"): "asc" | "desc" | undefined {
  switch (direction) {
    case "Ascending":
      return "asc"
    case "Descending":
      return "desc"
    default:
      return undefined
  }
}
