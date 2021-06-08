import React from "react"
import { Col, Divider, Row } from "antd"
import { TreeInterfaceComponentProps } from "plugins/ant/tree/types"

export function orientTreeAndDetails(
  orientation: TreeInterfaceComponentProps["detailsOrientation"],
  tree: React.ReactNode,
  details: React.ReactNode
): JSX.Element {
  if (orientation === "left")
    return (
      <Row>
        <Col span={8}>{details}</Col>
        <Col span={16}>{tree}</Col>
      </Row>
    )
  else if (orientation === "right")
    return (
      <Row>
        <Col span={8}>{tree}</Col>
        <Col span={16}>{details}</Col>
      </Row>
    )
  else if (orientation === "below")
    return (
      <>
        {tree}
        <Divider />
        {details}
      </>
    )

  console.warn(
    "TreeInterfaceComponent.orientTreeAndDetails",
    `Tree using default orientation because given orientation was ${orientation}`
  )
  return (
    <>
      {tree}
      {details}
    </>
  )
}
