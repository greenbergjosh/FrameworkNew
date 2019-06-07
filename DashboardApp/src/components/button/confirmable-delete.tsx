import React from "react"
import { ButtonProps } from "antd/lib/button"
import { Popover, Button, Icon, Row, Col, Typography } from "antd"

export interface Props {
  confirmationTitle?: string
  confirmationMessage: string
  onDelete: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
}

export function ConfirmableDeleteButton({
  confirmationMessage,
  confirmationTitle,
  onDelete,
  ...props
}: Props & ButtonProps) {
  const [isShowingConfirmation, setIsShowingConfirmation] = React.useState(false)
  const toggleConfirmation = React.useCallback(() => {
    setIsShowingConfirmation(!isShowingConfirmation)
  }, [isShowingConfirmation])

  return (
    <Popover
      content={getPopoverContent()}
      placement="topRight"
      title={getPopoverTitle()}
      trigger="click"
      visible={isShowingConfirmation}
      onVisibleChange={setIsShowingConfirmation}>
      <Button icon="delete" title="delete" type="danger" {...props}>
        {/* <Icon type="delete" /> */}
      </Button>
    </Popover>
  )

  function getPopoverContent() {
    return (
      <>
        <Typography.Paragraph>{confirmationMessage}</Typography.Paragraph>
        <Row>
          <Col span={12}>
            <Button block onClick={toggleConfirmation}>
              Cancel
            </Button>
          </Col>
          <Col span={12}>
            <Button block type="danger" onClick={onDelete}>
              Delete
            </Button>
          </Col>
        </Row>
      </>
    )
  }

  function getPopoverTitle() {
    return (
      confirmationTitle && (
        <Typography.Text strong={true}>
          <Icon type="warning" /> {confirmationTitle}
        </Typography.Text>
      )
    )
  }
}
