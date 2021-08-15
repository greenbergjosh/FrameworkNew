import { Button, Col, Popover, Row, Tooltip, Typography } from "antd"
import React from "react"
import { buttonManageForm } from "./button-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { ButtonInterfaceComponentProps, ButtonInterfaceComponentState } from "../../../plugins/ant/button/types"
import { EVENTS } from "./types"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { LayoutDefinition } from "../../../globalTypes"
import { parseLBM } from "../../../lib/parseLBM"
import { EventBus } from "../../../components/withEvents/EventBus"

export class ButtonInterfaceComponent extends BaseInterfaceComponent<
  ButtonInterfaceComponentProps,
  ButtonInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "value",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
      name: "button",
      title: "Button",
      icon: "play-circle",
      formControl: true,
      componentDefinition: {
        classNames: ["container"],
        component: "button",
      },
    }
  }

  static manageForm = buttonManageForm
  static availableEvents = [EVENTS.CLICK]

  constructor(props: ButtonInterfaceComponentProps) {
    super(props)

    this.state = {
      isShowingConfirmation: false,
    }
  }

  handleClick = (e: React.MouseEvent<HTMLInputElement>): void => {
    const { requireConfirmation, onChangeData, paramKVPMaps, disabled, useOnClick, onClickSrc } = this.props
    const { isShowingConfirmation } = this.state

    if (disabled) {
      e.stopPropagation()
      return
    }

    if (requireConfirmation && !isShowingConfirmation) {
      /*
       * Show Confirmation Dialog
       */
      this.setState({ isShowingConfirmation: true })
    } else {
      /*
       * Execute button actions
       */

      // Execute Configured Event Handler
      const onClickFunction = useOnClick
        ? parseLBM<ButtonInterfaceComponentProps, Record<string, unknown>, void>(onClickSrc)
        : undefined
      if (useOnClick && onClickFunction && this.props.mode !== "edit") {
        onClickFunction({
          props: this.props,
          lib: {
            getValue: this.getValue.bind(this),
            setValue: this.setValue.bind(this),
            raiseEvent: EventBus.raiseEvent,
          },
          args: {},
        })
      }

      // Copy data per KVP maps, and raise event
      if (onChangeData) {
        const eventPayload: JSONRecord = {}

        paramKVPMaps &&
          paramKVPMaps.values.forEach((map) => {
            eventPayload[map.targetKey] = this.getValue(map.sourceKey)
          })
        this.raiseEvent(EVENTS.CLICK, eventPayload)
      }

      // Close Popup
      this.setState({ isShowingConfirmation: false })
    }
  }

  handleCloseConfirmation = (/*{ target }: React.MouseEvent<HTMLInputElement>*/): void => {
    if (this.state.isShowingConfirmation) {
      this.setState({ isShowingConfirmation: false })
    }
  }

  handleConfirmationVisibleChange = (visible: boolean): void => {
    this.setState({ isShowingConfirmation: visible })
  }

  render(): JSX.Element {
    const {
      buttonLabel,
      icon,
      hideButtonLabel,
      shape,
      size,
      displayType,
      block,
      ghost,
      requireConfirmation,
      disabled = false,
      loading = false,
    } = this.props
    const isCircle = shape === "circle" || shape === "circle-outline"
    const buttonShape = displayType !== "link" ? shape : undefined
    const confirmation = {
      ...ButtonInterfaceComponent.getManageFormDefaults().confirmation,
      ...this.props.confirmation,
    }

    const content = (
      <Tooltip title={hideButtonLabel || isCircle ? buttonLabel : null} className={"container"}>
        <Button
          onClick={this.handleClick}
          icon={icon}
          shape={buttonShape}
          size={size}
          type={displayType}
          block={block}
          disabled={disabled}
          loading={loading}
          ghost={ghost}>
          {!hideButtonLabel && !isCircle ? buttonLabel : null}
        </Button>
      </Tooltip>
    )

    return requireConfirmation && !disabled ? (
      <Popover
        className={"container"}
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
