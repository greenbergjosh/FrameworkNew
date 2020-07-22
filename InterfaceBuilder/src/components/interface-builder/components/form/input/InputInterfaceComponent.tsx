import { Input } from "antd"
import { InputProps } from "antd/lib/input"
import { get, set } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { inputManageForm } from "./input-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"
import CharCounter from "../_shared/CharCounter"
import styles from "./input.module.scss"
import { Undraggable } from "../../_shared/Undraggable"

export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "input"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  maxLength: number
  size: InputProps["size"]
}

interface InputInterfaceComponentState {}

export class InputInterfaceComponent extends BaseInterfaceComponent<InputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "input",
      title: "Text Input",
      icon: "edit",
      formControl: true,
      componentDefinition: {
        component: "input",
        label: "Text",
      },
    }
  }

  static manageForm = inputManageForm

  constructor(props: InputInterfaceComponentProps) {
    super(props)
  }

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData(set(valueKey, value, userInterfaceData))
  }

  render(): JSX.Element {
    const { defaultValue, userInterfaceData, valueKey, maxLength, size } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    return (
      <div className={styles.wrapper}>
        <Undraggable>
          <Input
            onChange={this.handleChange}
            value={value}
            maxLength={maxLength}
            className={styles.input}
            size={size}
          />
        </Undraggable>
        <CharCounter text={value} maxLength={maxLength} className={styles.counter} />
      </div>
    )
  }
}
