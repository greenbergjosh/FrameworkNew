import { Button, Col, Popover, Row, Tooltip, Typography } from "antd"
import { get, merge } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { buttonDisplayType, buttonManageForm, shapeType, sizeType } from "./button-manage-form"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent"

interface ConfirmationProps {
  title?: string
  message?: string
  okText?: string
  cancelText?: string
}

export interface ButtonInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "button"
  requireConfirmation: boolean
  confirmation?: ConfirmationProps
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
  isShowingConfirmation: boolean
}

export class ButtonInterfaceComponent extends BaseInterfaceComponent<
  ButtonInterfaceComponentProps,
  ButtonInterfaceComponentState
> {
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
      },
    }
  }

  static manageForm = buttonManageForm

  constructor(props: ButtonInterfaceComponentProps) {
    super(props)

    this.state = {
      isShowingConfirmation: false,
    }
  }

  handleClick = ({ target }: React.MouseEvent<HTMLInputElement>) => {
    const { requireConfirmation } = this.props
    const { isShowingConfirmation } = this.state

    if (requireConfirmation && !isShowingConfirmation) {
      this.setState({ isShowingConfirmation: true })
    } else {
      // Do action
      console.log("ButtonInterfaceComponent.handleClick", "TODO: Perform action here")

      // Close Popup
      this.setState({ isShowingConfirmation: false })
    }
  }

  handleCloseConfirmation = ({ target }: React.MouseEvent<HTMLInputElement>) => {
    if (this.state.isShowingConfirmation) {
      this.setState({ isShowingConfirmation: false })
    }
  }

  handleConfirmationVisibleChange = (visible: boolean) => {
    this.setState({ isShowingConfirmation: visible })
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

      requireConfirmation,
    } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    const isCircle = shape === "circle" || shape === "circle-outline"
    const buttonShape = displayType !== "link" ? shape : undefined

    // Merge any incoming confirmation properties on top of the defaults
    const confirmation = merge(
      this.props.confirmation || {},
      ButtonInterfaceComponent.getManageFormDefaults().confirmation
    )

    const content = (
      <Tooltip title={hideButtonLabel || isCircle ? buttonLabel : null}>
        <Button
          onClick={this.handleClick}
          value={value}
          icon={icon}
          shape={buttonShape}
          size={size}
          type={displayType}
          block={block}
          ghost={ghost}>
          {!hideButtonLabel && !isCircle ? buttonLabel : null}
        </Button>
      </Tooltip>
    )

    return requireConfirmation ? (
      <Popover
        content={
          <>
            <Typography.Paragraph>{confirmation.message}</Typography.Paragraph>
            <Row>
              <Col span={12}>
                <Button block onClick={this.handleCloseConfirmation}>
                  {confirmation.cancelText}
                </Button>
              </Col>
              <Col span={12}>
                <Button block type="danger" onClick={this.handleClick}>
                  {confirmation.okText}
                </Button>
              </Col>
            </Row>
          </>
        }
        placement="topRight"
        title={confirmation.title}
        trigger="click"
        onVisibleChange={this.handleConfirmationVisibleChange}
        visible={this.state.isShowingConfirmation}>
        {content}
      </Popover>
    ) : (
      content
    )
  }
}
