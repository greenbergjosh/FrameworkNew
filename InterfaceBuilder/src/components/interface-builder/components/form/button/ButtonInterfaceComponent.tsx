import { Button, Col, Popover, Row, Tooltip, Typography } from "antd"
import { isUndefined, merge } from "lodash/fp"
import React from "react"
import { buttonManageForm } from "./button-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import {
  ButtonInterfaceComponentProps,
  ButtonInterfaceComponentState,
} from "components/interface-builder/components/form/button/types"
import { EVENTS } from "components/interface-builder/components/special/data-injector/types"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

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
  static availableEvents = ["valueChanged"]

  constructor(props: ButtonInterfaceComponentProps) {
    super(props)

    this.state = {
      isShowingConfirmation: false,
      loading: false,
    }
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps: Readonly<ButtonInterfaceComponentProps>): void {
    const nextValue = this.getValue(this.props.loadingKey) as boolean

    if (!isUndefined(nextValue) && this.state.loading !== nextValue) {
      this.setState({ loading: nextValue })
    }
  }

  // eslint-disable-next-line no-unused-vars
  handleClick = ({ target }: React.MouseEvent<HTMLInputElement>) => {
    const { requireConfirmation, onChangeData, paramKVPMaps } = this.props
    const { isShowingConfirmation } = this.state

    if (requireConfirmation && !isShowingConfirmation) {
      this.setState({ isShowingConfirmation: true })
    } else {
      if (onChangeData) {
        const eventPayload: JSONRecord = {}

        paramKVPMaps.values.forEach((map) => {
          eventPayload[map.sourceKey] = this.getValue(map.sourceKey)
        })
        this.raiseEvent(EVENTS.VALUE_CHANGED, eventPayload)
      }

      // Close Popup
      this.setState({ isShowingConfirmation: false })
    }
  }

  // eslint-disable-next-line no-unused-vars
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
          icon={icon}
          shape={buttonShape}
          size={size}
          type={displayType}
          block={block}
          loading={this.state.loading}
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
