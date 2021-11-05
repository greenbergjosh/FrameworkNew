import { Button, Form, Icon } from "antd"
import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { settings } from "./settings"
import {
  DateAction,
  DateStepperInterfaceComponentProps,
  DateStepperInterfaceComponentState,
  DateValuesType,
} from "./types"
import { next, prev, stepDateRangeValues, stepSingleDateValue, today } from "./utils"
import layoutDefinition from "./layoutDefinition"

export default class DateStepperInterfaceComponent extends BaseInterfaceComponent<
  DateStepperInterfaceComponentProps,
  DateStepperInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  /* ***********************************************
   *
   * Event Handlers
   */

  stepDates = (action: DateAction) => {
    const {
      dateKey,
      endDateKey,
      isDateRange,
      startDateKey,
      dateFormat,
      userInterfaceData,
      onChangeData,
      submit,
      executeImmediately,
    } = this.props
    let newValues: DateValuesType

    if (isDateRange) {
      newValues = stepDateRangeValues(
        this.getValue(startDateKey),
        this.getValue(endDateKey),
        startDateKey,
        endDateKey,
        action,
        dateFormat
      )
    } else {
      newValues = stepSingleDateValue(this.getValue(dateKey), dateKey, action, dateFormat)
    }
    const newUserInterfaceData = { ...userInterfaceData, ...newValues }

    onChangeData && onChangeData(newUserInterfaceData)
    if (executeImmediately) {
      submit && submit()
    }
  }

  /* ***********************************************
   *
   * Render
   */

  render(): JSX.Element {
    const { size } = this.props
    return (
      <Form.Item>
        <Button.Group size={size}>
          <Button onClick={() => this.stepDates(prev)} size={size}>
            <Icon type="left" />
            Prev Day
          </Button>
          <Button onClick={() => this.stepDates(today)} size={size}>
            Today
          </Button>
          <Button onClick={() => this.stepDates(next)} size={size}>
            Next Day
            <Icon type="right" />
          </Button>
        </Button.Group>
      </Form.Item>
    )
  }
}
