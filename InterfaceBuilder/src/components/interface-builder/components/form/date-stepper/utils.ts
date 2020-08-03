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
  action: DateAction
): DateValuesType {
  const strDate = get(dateKey, userInterfaceData)
  let date = moment(strDate)

  if (!date.isValid()) {
    console.warn(`Date Stepper received an invalid date: "${strDate}". Defaulting to today.`)
    date = moment()
  }
  return set(dateKey, action(date, "none"), {})
}

export function stepDateRangeValues(
  startDateKey: string,
  endDateKey: string,
  userInterfaceData: UserInterfaceProps["data"],
  action: DateAction
): DateValuesType {
  const strStartDate = get(startDateKey, userInterfaceData)
  const strEndDate = get(endDateKey, userInterfaceData)
  let startDate = moment(strStartDate)
  let endDate = moment(strEndDate)
  let newValue = {}

  if (!startDate.isValid()) {
    console.warn(`Date Stepper received an invalid Start Date: "${strStartDate}". Defaulting to today.`)
    startDate = moment()
  }

  if (!endDate.isValid()) {
    console.warn(`Date Stepper received an invalid End Date: "${strEndDate}". Defaulting to today.`)
    endDate = moment()
  }

  newValue = set(startDateKey, action(startDate, "start"), newValue)
  newValue = set(endDateKey, action(endDate, "end"), newValue)
  return newValue
}
