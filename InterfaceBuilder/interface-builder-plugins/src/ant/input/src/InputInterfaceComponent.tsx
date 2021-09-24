import React from "react"
import { Input } from "antd"
import { inputManageForm } from "./input-manage-form"
import { InputProps } from "antd/lib/input"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  Undraggable,
} from "@opg/interface-builder"
import CharCounter from "@opg/interface-builder-plugins/lib/ant/shared/CharCounter"
import styles from "./styles.scss"
import layoutDefinition from "./layoutDefinition"

export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "input"
  defaultValue?: string
  placeholder?: string
  valueKey: string
  maxLength: number
  size: InputProps["size"]
}

// interface InputInterfaceComponentState {}

export default class InputInterfaceComponent extends BaseInterfaceComponent<InputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = inputManageForm

  constructor(props: InputInterfaceComponentProps) {
    super(props)
  }

  /**
   * Public method for external clients to trigger a submit
   * @public
   */
  public reset(): void {
    this.setValue([this.props.valueKey, this.props.defaultValue || ""])
  }

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    this.setValue([this.props.valueKey, value])
  }

  render(): JSX.Element {
    const { defaultValue, valueKey, maxLength, size, placeholder } = this.props
    const rawValue = this.getValue(valueKey)
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
            placeholder={placeholder}
          />
        </Undraggable>
        <CharCounter text={value} maxLength={maxLength} className={styles.counter} />
      </div>
    )
  }
}
