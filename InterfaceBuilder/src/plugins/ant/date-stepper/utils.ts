import { isEmpty, set } from "lodash/fp"
import moment, { Moment } from "moment"
import { DateAction, DateFormat, DateValuesType } from "./types"

function parseDate(dateFormat: DateFormat, strDate?: string): Moment {
  return !isEmpty(strDate) ? moment(strDate) : moment()
}

function formatDate(date: Moment): string {
  return date.toDate().toISOString()
}

export const next: DateAction = (date /*, dateFormat*/) => formatDate(date.add(1, "days") /*, dateFormat*/)

export const prev: DateAction = (date /*, dateFormat*/) => formatDate(date.subtract(1, "days") /*, dateFormat*/)

export const today: DateAction = (date, dateFormat, bound) => {
  const today = parseDate(dateFormat)
  switch (bound) {
    case "start":
      return formatDate(today.startOf("day"))
    case "end":
      return formatDate(today.endOf("day"))
    default:
      return formatDate(today.startOf("day"))
  }
}

export function stepSingleDateValue(
  strDate: string,
  dateKey: string,
  action: DateAction,
  dateFormat: DateFormat = "locale"
): DateValuesType {
  let date = parseDate(dateFormat, strDate)

  if (!date.isValid()) {
    console.warn(`Date Stepper received an invalid date: "${strDate}". Defaulting to today.`)
    date = parseDate(dateFormat)
  }
  return set(dateKey, action(date, dateFormat, "none"), {})
}

export function stepDateRangeValues(
  strStartDate: string,
  strEndDate: string,
  startDateKey: string,
  endDateKey: string,
  action: DateAction,
  dateFormat: DateFormat = "locale"
): DateValuesType {
  let startDate = parseDate(dateFormat, strStartDate)
  let endDate = parseDate(dateFormat, strEndDate)
  let newValue = {}

  if (!startDate.isValid()) {
    console.warn(`Date Stepper received an invalid Start Date: "${strStartDate}". Defaulting to today.`)
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
