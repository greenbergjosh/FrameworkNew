import { get, isEmpty, set } from "lodash/fp"
import moment, { Moment } from "moment"
import { DateAction, DateFormat, DateValuesType } from "./types"
import { UserInterfaceProps } from "../../../globalTypes"

function parseDate(dateFormat: DateFormat, strDate?: string): Moment {
  return !isEmpty(strDate) ? moment(strDate) : moment()
  // switch (dateFormat) {
  //   case "iso-8601":
  //     // Format: YYYY-MM-DDTHH:mm:ss.sssZ
  //     // Example: "2012-01-20T16:51:36.000Z"
  //     return !isEmpty(strDate) ? moment(strDate) : moment()
  //   case "gmt":
  //     // UTC time is the same as GMT time
  //     // Example: "Thu, 24 Dec 2020 23:59:59 GMT"
  //     return !isEmpty(strDate) ? moment.utc(strDate) : moment.utc()
  //   default:
  //     // "locale"
  //     // Example: "1/7/2021, 10:37:56 AM"
  //     // moment(...) is local mode (see https://momentjs.com/docs/#/parsing/)
  //     return !isEmpty(strDate) ? moment(strDate) : moment()
  // }
}

function formatDate(date: Moment, dateFormat: DateFormat): string {
  return date.toDate().toISOString()
  // switch (dateFormat) {
  //   case "iso-8601":
  //     // Format: YYYY-MM-DDTHH:mm:ss.sssZ
  //     // Example: "2012-01-20T16:51:36.000Z"
  //     return date.toDate().toISOString()
  //   case "gmt":
  //     // UTC time is the same as GMT time
  //     // Example: "Thu, 24 Dec 2020 23:59:59 GMT"
  //     return date.toDate().toUTCString()
  //   default:
  //     // "locale"
  //     // Example: "1/7/2021, 10:37:56 AM"
  //     return date.toDate().toLocaleString()
  // }
}

export const next: DateAction = (date, dateFormat) => formatDate(date.add(1, "days"), dateFormat)

export const prev: DateAction = (date, dateFormat) => formatDate(date.subtract(1, "days"), dateFormat)

export const today: DateAction = (date, dateFormat, bound) => {
  const today = parseDate(dateFormat)
  switch (bound) {
    case "start":
      return formatDate(today.startOf("day"), dateFormat)
    case "end":
      return formatDate(today.endOf("day"), dateFormat)
    default:
      return formatDate(today.startOf("day"), dateFormat)
  }
}

export function stepSingleDateValue(
  dateKey: string,
  userInterfaceData: UserInterfaceProps["data"],
  action: DateAction,
  dateFormat: DateFormat = "locale"
): DateValuesType {
  const strDate = get(dateKey, userInterfaceData)
  let date = parseDate(dateFormat, strDate)

  if (!date.isValid()) {
    console.warn(`Date Stepper received an invalid date: "${strDate}". Defaulting to today.`)
    date = parseDate(dateFormat)
  }
  return set(dateKey, action(date, dateFormat, "none"), {})
}

export function stepDateRangeValues(
  startDateKey: string,
  endDateKey: string,
  userInterfaceData: UserInterfaceProps["data"],
  action: DateAction,
  dateFormat: DateFormat = "locale"
): DateValuesType {
  const strStartDate = get(startDateKey, userInterfaceData)
  const strEndDate = get(endDateKey, userInterfaceData)
  let startDate = parseDate(dateFormat, strStartDate)
  let endDate = parseDate(dateFormat, strEndDate)
  let newValue = {}

  if (!startDate.isValid()) {
    console.warn(`Date Stepper received an invalid Starßt Date: "${strStartDate}". Defaulting to today.`)
    startDate = parseDate(dateFormat)
  }

  if (!endDate.isValid()) {
    console.warn(`Date Stepper received an invalid End Date: "${strEndDate}". Defaulting to today.`)
    endDate = parseDate(dateFormat)
  }

  newValue = set(startDateKey, action(startDate, dateFormat, "start"), newValue)
  newValue = set(endDateKey, action(endDate, dateFormat, "end"), newValue)
  return newValue
}
