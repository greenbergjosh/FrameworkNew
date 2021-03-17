import { ClickParam } from "antd/lib/menu"
import { Profile } from "../../../../state/iam/iam"
import { Avatar, Button, Icon, Menu, Popover } from "antd"
import React from "react"
import styles from "../Header/header.module.scss"

export function ProfileMenu(props: { onClick: (evt: ClickParam) => void; profile: Profile }): JSX.Element {
  return (
    <Popover
      placement="bottomRight"
      title={
        <div style={{ padding: "5px 0" }}>
          <strong>{props.profile.Name}</strong>
          <br />
          {props.profile.Email}
        </div>
      }
      content={
        <Menu onClick={props.onClick} style={{ border: "none" }}>
          <Menu.Item key="logout" style={{ marginLeft: -16, marginRight: -16 }}>
            <Icon type="logout" />
            <span>Logout</span>
          </Menu.Item>
        </Menu>
      }>
      <Button shape="circle" htmlType="button" type="link" className={styles.userAvatar}>
        {props.profile.ImageUrl ? (
          <Avatar src={props.profile.ImageUrl} alt={props.profile.Name} />
        ) : (
          props.profile.Name.substring(0, 1)
        )}
      </Button>
    </Popover>
  )
}
