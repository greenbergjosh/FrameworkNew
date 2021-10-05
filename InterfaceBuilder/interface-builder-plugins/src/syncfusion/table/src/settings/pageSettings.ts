import { ActionEventArgs, PageSettingsModel } from "@syncfusion/ej2-react-grids"
import { isEmpty, isNumber, isString, toNumber } from "lodash/fp"

const ALLSIZE = 999999
const DEFAULTSIZE = 50

/**
 *
 * @param rawDefaultPageSize
 * @param encoded
 * @return PageSettingsModel
 */
export function getPageSettings(rawDefaultPageSize?: number | string, encoded?: string): PageSettingsModel | undefined {
  let defaultPageSize: number = DEFAULTSIZE
  if (isNumber(rawDefaultPageSize)) {
    defaultPageSize = toNumber(rawDefaultPageSize)
  } else if (rawDefaultPageSize === "All") {
    defaultPageSize = ALLSIZE
  }
  const decodedPaging = encoded && decodePaging(encoded, defaultPageSize)
  const rawPageSize = decodedPaging && isNumber(decodedPaging.pageSize) ? decodedPaging.pageSize : defaultPageSize
  const pageSize = pageSizeToNumber(rawPageSize, defaultPageSize)
  const currentPage = decodedPaging ? decodedPaging.currentPage : 1
  const pageNumSizes = [25, 50, 100, 150, 200, 500]
  if (!pageNumSizes.includes(pageSize) && pageSize !== ALLSIZE) {
    pageNumSizes.push(pageSize)
    pageNumSizes.sort((a, b) => a - b)
  }

  return {
    pageSize,
    currentPage,
    pageSizes: ["All", ...pageNumSizes],
  }
}

/* *****************************************************************************
 *
 * DECODING
 */

/**
 *
 * @param encoded
 * @param defaultPageSize
 * @returns { pageSize, currentPage }
 */
export function decodePaging(encoded: string, defaultPageSize: number): PageSettingsModel {
  return parsePaging(encoded, defaultPageSize)
}

/**
 *
 * @param encodedValues
 * @param defaultPageSize
 * @returns { pageSize, currentPage }
 */
function parsePaging(encodedValues: string, defaultPageSize: number): PageSettingsModel {
  if (!encodedValues || isEmpty(encodedValues) || !isString(encodedValues)) {
    return {}
  }
  const parts = encodedValues.split("~")
  const pageSize = pageSizeToNumber(parts[1], defaultPageSize)
  const currentPage = toNumber(parts[0])
  return {
    pageSize,
    currentPage,
  }
}

/* *****************************************************************************
 *
 * ENCODING
 */

/**
 *
 * @param arg
 * @param rawPageSize
 * @param rawTotalRecordsCount
 * @return string[]
 */
export function encodePaging(
  arg: ActionEventArgs,
  rawPageSize: string | number | undefined,
  rawTotalRecordsCount: string | number | undefined
): string {
  const totalRecordsCount = isNumber(rawTotalRecordsCount) ? toNumber(rawTotalRecordsCount) : DEFAULTSIZE
  const pageSize = isNumber(rawPageSize) ? toNumber(rawPageSize) : DEFAULTSIZE
  const stringifiedPaging = stringifyPaging(arg, pageSize, totalRecordsCount)
  if (!stringifiedPaging) {
    return `1~${DEFAULTSIZE}`
  }
  return stringifiedPaging
}

/**
 *
 * @param arg
 * @param pageSize
 * @param totalRecordsCount
 * @return `${currentPage}~${pageSize}`
 */
export function stringifyPaging(arg: ActionEventArgs, pageSize: number, totalRecordsCount: number): string | undefined {
  if (arg.requestType === "paging" && arg.currentPage) {
    return `${arg.currentPage}~${numberToPageSize(pageSize, totalRecordsCount)}`
  }
}

function pageSizeToNumber(size: number | string, defaultPageSize: number): number {
  if (typeof size === "number") {
    return size
  }
  if (size === "All") {
    return ALLSIZE
  }
  const parsedPageSize = Number.parseInt(size, 10)
  if (!isNaN(parsedPageSize)) {
    return parsedPageSize
  }
  return defaultPageSize
}

function numberToPageSize(size: number, totalRecordsCount: number): "All" | number {
  if (size >= ALLSIZE || size === totalRecordsCount) return "All"
  return size
}
