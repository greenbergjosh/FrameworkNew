import React, { useEffect, useState } from "react"
import { Drawer } from "antd"
import styles from "../styles.scss"

interface ResizableDrawerProps extends React.PropsWithChildren<any> {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
}

const ResizableDrawer = (props: ResizableDrawerProps) => {
  const initialWidth = 300
  const minWidth = 48 // Accommodate close button
  const maxWidth = 700
  const [isResizing, setIsResizing] = useState(false)
  const [width, setWidth] = useState(initialWidth)

  const onMouseDown = (): void => setIsResizing(true)
  const onMouseUp = (): void => setIsResizing(false)
  const onMouseMove = (e: MouseEvent): void => {
    if (isResizing) {
      const offsetRight = document.body.offsetWidth - (e.clientX - document.body.offsetLeft)
      if (offsetRight > minWidth && offsetRight < maxWidth) {
        setWidth(offsetRight)
      }
    }
  }

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  })

  return (
    <Drawer
      bodyStyle={{ padding: 0 }}
      className={styles.resizableDrawer}
      closable={true}
      getContainer={false}
      headerStyle={{ padding: 0 }}
      mask={false}
      onClose={() => props.setOpen(false)}
      placement="right"
      style={{ position: "absolute" }}
      visible={props.isOpen}
      width={width}>
      <div className={styles.divider} onMouseDown={onMouseDown} />
      {props.children}
    </Drawer>
  )
}

export default ResizableDrawer
