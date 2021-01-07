import { get, set, isEmpty } from "lodash/fp"
import moment, { Moment } from "moment"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { DateAction, DateValuesType, TimeFormat } from "./types"

function parseDate(timeFormat: TimeFormat, strDate?: string): Moment {
  return !isEmpty(strDate) ? moment(strDate) : moment()
  // switch (timeFormat) {
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

function formatDate(date: Moment, timeFormat: TimeFormat): string {
  return date.toDate().toISOString()
  // switch (timeFormat) {
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

export const next: DateAction = (date, timeFormat) => formatDate(date.add(1, "days"), timeFormat)

export const prev: DateAction = (date, timeFormat) => formatDate(date.subtract(1, "days"), timeFormat)

export const today: DateAction = (date, timeFormat, bound) => {
  const today = parseDate(timeFormat)
  switch (bound) {
    case "start":
      return formatDate(today.startOf("day"), timeFormat)
    case "end":
      return formatDate(today.endOf("day"), timeFormat)
    default:
      return formatDate(today.startOf("day"), timeFormat)
  }
}

export function stepSingleDateValue(
  dateKey: string,
  userInterfaceData: UserInterfaceProps["data"],
  action: DateAction,
  timeFormat: TimeFormat = "locale"
): DateValuesType {
  const strDate = get(dateKey, userInterfaceData)
  let date = parseDate(timeFormat, strDate)

  if (!date.isValid()) {
    console.warn(`Date Stepper received an invalid date: "${strDate}". Defaulting to today.`)
    date = parseDate(timeFormat)
  }
  return set(dateKey, action(date, timeFormat, "none"), {})
}

export function stepDateRangeValues(
  startDateKey: string,
  endDateKey: string,
  userInterfaceData: UserInterfaceProps["data"],
  action: DateAction,
  timeFormat: TimeFormat = "locale"
): DateValuesType {
  const strStartDate = get(startDateKey, userInterfaceData)
  const strEndDate = get(endDateKey, userInterfaceData)
  let startDate = parseDate(timeFormat, strStartDate)
  let endDate = parseDate(timeFormat, strEndDate)
  let newValue = {}

  if (!startDate.isValid()) {
    console.warn(`Date Stepper received an invalid Starßt Date: "${strStartDate}". Defaulting to today.`)
    startDate = parseDate(timeFormat)
  }

  if (!endDate.isValid()) {
    console.warn(`Date Stepper received an invalid End Date: "${strEndDate}". Defaulting to today.`)
    endDate = parseDate(timeFormat)
  }

  newValue = set(startDateKey, action(startDate, timeFormat, "start"), newValue)
  newValue = set(endDateKey, action(endDate, timeFormat, "end"), newValue)
  return newValue
}
