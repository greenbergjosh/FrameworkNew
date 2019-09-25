import { Form, Button, Icon, Tooltip } from "antd"
import { get, set, throttle } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { buttonManageForm, buttonDisplayType, shapeType, sizeType } from "./button-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface ButtonInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "button"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  buttonLabel: string
  icon: string
  hideButtonLabel: boolean
  shape: shapeType
  size: sizeType
  displayType: buttonDisplayType
  block: boolean
  ghost: boolean
}

interface ButtonInterfaceComponentState {
}

export class ButtonInterfaceComponent extends BaseInterfaceComponent<ButtonInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "button",
      title: "Button",
      icon: "play-circle",
      formControl: true,
      componentDefinition: {
        component: "button",
        label: "Text",
      },
    }
  }

  static manageForm = buttonManageForm

  constructor(props: ButtonInterfaceComponentProps) {
    super(props)
  }

  handleClick = ({ target }: React.MouseEvent<HTMLInputElement>) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    // onChangeData && onChangeData(set(valueKey, value, userInterfaceData))
  }

  render(): JSX.Element {
    const {
      defaultValue,
      userInterfaceData,
      valueKey,
      buttonLabel,
      icon,
      hideButtonLabel,
      shape,
      size,
      displayType,
      block,
      ghost,
    } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    const isCircle = shape === "circle" || shape === "circle-outline"
    const buttonShape = displayType !== "link" ? shape : undefined
    return (
      <Tooltip title={hideButtonLabel || isCircle ? buttonLabel : null}>
        <Button
          onClick={this.handleClick}
          value={value}
          icon={icon}
          shape={buttonShape}
          size={size}
          type={displayType}
          block={block}
          ghost={ghost}
        >{!hideButtonLabel && !isCircle ? buttonLabel : null}</Button>
      </Tooltip>
    )
  }
}
