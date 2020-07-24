import { Button, Col, Popover, Row, Tooltip, Typography } from "antd"
import React from "react"
import { SubmitButtonProps } from "../types"

export const SubmitButton = ({ onSubmit, loading, submitButtonLabel, submitButtonProps }: SubmitButtonProps) => {
  const {
    block,
    buttonLabel,
    confirmation,
    displayType,
    ghost,
    hideButtonLabel,
    icon,
    requireConfirmation,
    shape,
    size,
  } = submitButtonProps || {}
  const isCircle = shape === "circle" || shape === "circle-outline"
  const buttonShape = displayType !== "link" ? shape : undefined
  // submitButtonLabel is retained for legacy clients
  const submitButtonLabelDefaulted = buttonLabel || submitButtonLabel || "Generate Report"
  const [isShowingConfirmation, setIsShowingConfirmation] = React.useState(false)

  /*************************
   *
   * EVENT HANDLERS
   */

  const handleSendQueryClick = () => {
    setIsShowingConfirmation(false)
    onSubmit()
  }

  const handleCloseConfirmation = ({ target }: React.MouseEvent<HTMLInputElement>) => {
    if (isShowingConfirmation) {
      setIsShowingConfirmation(false)
    }
  }

  const handleConfirmationVisibleChange = (visible: boolean) => {
    setIsShowingConfirmation(visible)
  }

  /*************************
   *
   * RENDER
   */

  const button = (
    <Tooltip title={hideButtonLabel || isCircle ? buttonLabel : null}>
      <Button
        block={block}
        icon={icon}
        loading={loading}
        onClick={() => (requireConfirmation ? null : handleSendQueryClick())}
        shape={buttonShape}
        size={size}
        type={displayType}
        ghost={ghost}>
        {!hideButtonLabel && !isCircle ? submitButtonLabelDefaulted : null}
      </Button>
    </Tooltip>
  )

  return requireConfirmation ? (
    <Popover
      content={
        <div style={{ maxWidth: 350 }}>
          <Typography.Paragraph>
            {(confirmation && confirmation.message) || "Do you want to proceed?"}
          </Typography.Paragraph>
          <Row>
            <Col span={12}>
              <Button block onClick={handleCloseConfirmation}>
                {(confirmation && confirmation.cancelText) || "Cancel"}
              </Button>
            </Col>
            <Col span={12}>
              <Button block type="danger" onClick={handleSendQueryClick}>
                {(confirmation && confirmation.okText) || "OK"}
              </Button>
            </Col>
          </Row>
        </div>
      }
      onVisibleChange={handleConfirmationVisibleChange}
      placement="topRight"
      title={(confirmation && confirmation.title) || "Please confirm"}
      trigger="click"
      visible={isShowingConfirmation}>
      {button}
    </Popover>
  ) : (
    button
  )
}
