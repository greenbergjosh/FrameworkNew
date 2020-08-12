import { Button, Icon } from "antd"
import React from "react"

export function ZoomControls(props: { onZoomOut: () => void; onReset: () => void; onZoomIn: () => void }) {
  return (
    <div style={{ textAlign: "center", marginTop: "-30px" }}>
      <Button.Group size="small">
        <Button onClick={props.onZoomOut}>
          <Icon type="zoom-out" />
        </Button>
        <Button onClick={props.onReset}>
          <Icon type="home" />
        </Button>
        <Button onClick={props.onZoomIn}>
          <Icon type="zoom-in" />
        </Button>
      </Button.Group>
    </div>
  )
}
