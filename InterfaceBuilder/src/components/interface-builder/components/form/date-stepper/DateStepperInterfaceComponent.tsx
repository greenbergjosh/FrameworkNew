import { Button, Form, Icon } from "antd"
import React from "react"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { dateStepperManageForm } from "./date-stepper-manage-form"
import {
  DateAction,
  DateStepperInterfaceComponentProps,
  DateStepperInterfaceComponentState,
  DateValuesType,
} from "./types"
import { next, prev, stepDateRangeValues, stepSingleDateValue, today } from "./utils"

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
      userInterfaceData,
      onChangeData,
      submit,
      executeImmediately,
    } = this.props
    let newValues: DateValuesType

    if (isDateRange) {
      newValues = stepDateRangeValues(startDateKey, endDateKey, userInterfaceData, action)
    } else {
      newValues = stepSingleDateValue(dateKey, userInterfaceData, action)
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
