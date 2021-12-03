import { SortableGroupableColumnModel } from "types"
import { ActionEventArgs, FilterSettingsModel, PredicateModel } from "@syncfusion/ej2-react-grids"
import { get, isArray, isEmpty, isString } from "lodash/fp"

export type EncodedFilterBy = string | string[] | null

/**
 *
 * @param columns
 * @param encodedFilterBy
 * @return FilterSettingsModel
 */
export function getFilterSettings(
  columns: SortableGroupableColumnModel[],
  encodedFilterBy: EncodedFilterBy
): FilterSettingsModel {
  const decodedFilters = decodeFilters(encodedFilterBy)
  const filterColumns = decodedFilters.reduce<PredicateModel[]>((predicates, param) => {
    const col = columns.find((c) => c.field === param.field)
    if (col && !isEmpty(param)) {
      const p = { ...param }
      if (col.uid) {
        p.uid = col.uid
      }
      predicates.push(p)
    }
    return predicates
  }, [])
  return {
    type: "Menu",
    columns: filterColumns,
  }
}

/* *****************************************************************************
 *
 * DECODING
 */

/**
 *
 * @param encoded
 * @returns { field, operator, value }[]
 */
export function decodeFilters(encoded: EncodedFilterBy): Partial<PredicateModel>[] {
  if (isArray(encoded)) {
    const encodedFilters = encoded as string[]
    const filters = encodedFilters.reduce<Partial<PredicateModel>[]>((acc, item) => {
      const predicate = parseFilter(item)
      acc.push(predicate)
      return acc
    }, [])
    console.log({ filterSettings: filters })
    return filters
  }
  /*
   * When there is only one encoded filter,
   * it is a string instead of an array
   */
  return [parseFilter(encoded as string | undefined)]
}

/**
 *
 * https://ej2.syncfusion.com/angular/documentation/grid/filtering/#filter-bar
 * @param encodedValues
 * @returns { field, operator, value }
 */
function parseFilter(encodedValues?: string): Partial<PredicateModel> {
  if (!encodedValues || isEmpty(encodedValues)) {
    return {}
  }
  const parts = encodedValues.split("~")
  return {
    field: parts[0],
    operator: parts[1],
    value: parts[2],
  }
}

/* *****************************************************************************
 *
 * ENCODING
 */

/**
 *
 * @param arg
 * @param prevFilters
 * @return string[]
 */
export function encodeFilters(arg: ActionEventArgs, prevFilters: EncodedFilterBy): EncodedFilterBy {
  const fieldName = get("field", arg.currentFilterObject)

  /* Nothing to do */
  if (!fieldName || isEmpty(fieldName)) {
    return prevFilters
  }

  /* Remove Filter */
  if (arg.action === "clearFilter") {
    if (!prevFilters) {
      return []
    }
    if (isString(prevFilters)) {
      // Previous filters is a string, so remove the filter and return an array
      return prevFilters.startsWith(fieldName) ? null : prevFilters
    }
    if (isArray(prevFilters)) {
      // Find the filter and remove it
      const delIndex = prevFilters.findIndex((item) => item.startsWith(fieldName))
      if (delIndex > -1) {
        const nextFilters = [...prevFilters]
        nextFilters.splice(delIndex, 1)
        return nextFilters
      }
    }
  }

  /* Update Filter */
  const newFilter = stringifyFilter(arg)
  if (newFilter && !isEmpty(newFilter)) {
    if (!prevFilters || prevFilters.length < 1) {
      return newFilter
    }
    if (prevFilters && isString(prevFilters)) {
      // prevFilters is a string (not an array), so add/update string and return an array
      return prevFilters.startsWith(fieldName) ? newFilter : [prevFilters, newFilter]
    }
    if (isArray(prevFilters)) {
      // Add or update filters
      const indexToUpdate = prevFilters.findIndex((item) => item.startsWith(fieldName))
      const nextFilters = [...prevFilters]
      if (indexToUpdate > -1) {
        nextFilters[indexToUpdate] = newFilter
      } else {
        nextFilters.push(newFilter)
      }
      return nextFilters
    }
  }

  // Give up and return the original filters
  return prevFilters
}

/**
 *
 * @param arg
 * @return `${field}~${operator}~${value}`
 */
export function stringifyFilter(arg: ActionEventArgs): string | undefined {
  if (arg.requestType === "filtering" && arg.currentFilterObject) {
    const { field, operator, value } = arg.currentFilterObject
    const strValue = isString(value) ? value : JSON.stringify(value, null, " ")
    const safeValue = strValue.toLowerCase()
    return `${field}~${operator}~${safeValue}`
  }
}
