import { get, set } from "lodash/fp"
import moment from "moment"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { DateAction, DateValuesType } from "./types"

export const next: DateAction = (date) => date.add(1, "days").toISOString()

export const prev: DateAction = (date) => date.subtract(1, "days").toISOString()

export const today: DateAction = (date, bound) => {
  const today = moment.utc()
  switch (bound) {
    case "start":
      return today.startOf("day").toISOString()
    case "end":
      return today.endOf("day").toISOString()
    default:
      return today.startOf("day").toISOString()
  }
}

export function stepSingleDateValue(
  dateKey: string,
  userInterfaceData: UserInterfaceProps["data"],
  action: DateAction,
  timeZone = "local"
): DateValuesType {
  const strDate = get(dateKey, userInterfaceData)
  let date = moment(strDate)

  if (!date.isValid()) {
    console.warn(`Date Stepper received an invalid date: "${strDate}". Defaulting to today.`)
    // moment(...) is local mode (see https://momentjs.com/docs/#/parsing/)
    date = timeZone === "gmt" ? moment.utc() : moment()
  }
  return set(dateKey, action(date, "none"), {})
}

export function stepDateRangeValues(
  startDateKey: string,
  endDateKey: string,
  userInterfaceData: UserInterfaceProps["data"],
  action: DateAction,
  timeZone = "local"
): DateValuesType {
  const strStartDate = get(startDateKey, userInterfaceData)
  const strEndDate = get(endDateKey, userInterfaceData)
  // moment(...) is local mode (see https://momentjs.com/docs/#/parsing/)
  let startDate = timeZone === "gmt" ? moment.utc(strStartDate) : moment(strStartDate)
  let endDate = timeZone === "gmt" ? moment.utc(strEndDate) : moment(strEndDate)
  let newValue = {}

  if (!startDate.isValid()) {
    console.warn(`Date Stepper received an invalid Starßt Date: "${strStartDate}". Defaulting to today.`)
    // moment(...) is local mode (see https://momentjs.com/docs/#/parsing/)
    startDate = timeZone === "gmt" ? moment.utc() : moment()
  }

  if (!endDate.isValid()) {
    console.warn(`Date Stepper received an invalid End Date: "${strEndDate}". Defaulting to today.`)
    // moment(...) is local mode (see https://momentjs.com/docs/#/parsing/)
    endDate = timeZone === "gmt" ? moment.utc() : moment()
  }

  newValue = set(startDateKey, action(startDate, "start"), newValue)
  newValue = set(endDateKey, action(endDate, "end"), newValue)
  return newValue
}
