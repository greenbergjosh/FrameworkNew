import { Button, Icon } from "antd"
import { get, set, forEach } from "lodash/fp"
import moment, { Moment } from "moment"
import React from "react"
import { dateStepperManageForm } from "./date-stepper-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { DateStepperInterfaceComponentProps, DateStepperInterfaceComponentState } from "./types"

type DateAction = (date: Moment, bound: "start" | "end" | "none") => string
const next: DateAction = (date) => date.add(1, "days").toISOString()
const prev: DateAction = (date) => date.subtract(1, "days").toISOString()
const today: DateAction = (date, bound) => {
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

export class DateStepperInterfaceComponent extends BaseInterfaceComponent<
  DateStepperInterfaceComponentProps,
  DateStepperInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "date-stepper",
      title: "Date Stepper",
      icon: "calendar",
      formControl: true,
      componentDefinition: {
        component: "date-stepper",
        label: "Date Stepper",
      },
    }
  }

  static manageForm = dateStepperManageForm

  handleChange = (action: DateAction) => {
    const {
      onChangeData,
      userInterfaceData,
      isDateRange,
      dateKey,
      startDateKey,
      endDateKey,
    } = this.props
    let newValues: { [key: string]: string } = {}

    if (isDateRange) {
      const strStartDate = get(startDateKey, userInterfaceData)
      const strEndDate = get(endDateKey, userInterfaceData)
      let startDate = moment(strStartDate)
      let endDate = moment(strEndDate)

      if (!startDate.isValid() || !endDate.isValid()) {
        console.warn(
          `Date Stepper received an invalid date. Start Date: "${strStartDate}", End Date: "${strEndDate}"`
        )
        return
      }
      newValues = set(startDateKey, action(startDate, "start"), newValues)
      newValues = set(endDateKey, action(endDate, "end"), newValues)
    } else {
      const strDate = get(dateKey, userInterfaceData)
      let date = moment(strDate)

      if (!date.isValid()) {
        console.warn(`Date Stepper received an invalid date: "${strDate}"`)
        return
      }
      newValues = set(dateKey, action(date, "none"), newValues)
    }

    onChangeData && onChangeData({ ...userInterfaceData, ...newValues })
  }

  render(): JSX.Element {
    const { size } = this.props
    return (
      <Button.Group size={size}>
        <Button onClick={() => this.handleChange(prev)} size={size}>
          <Icon type="left" />
          Prev Day
        </Button>
        <Button onClick={() => this.handleChange(today)} size={size}>
          Today
        </Button>
        <Button onClick={() => this.handleChange(next)} size={size}>
          Next Day
          <Icon type="right" />
        </Button>
      </Button.Group>
    )
  }
}
