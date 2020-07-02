import { Button } from "antd"
import React from "react"
import { useRematch } from "../../hooks/use-rematch"

export const GoogleAuth = (): JSX.Element => {
  const [, dispatch] = useRematch((s) => null)

  return (
    <Button block={true} htmlType="button" icon="google" onClick={() => dispatch.iam.authViaGoogleOAuth()}>
      Sign In With Google
    </Button>
  )
}

/*

<Dropdown
        overlay={
          <Menu>
            <Menu.Item key="username">
              <span>{profile.name}</span>
            </Menu.Item>
            <Menu.Item key="email">
              <Icon type="mail" />
              <span>
                <i>{profile.email}</i>
              </span>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout">
              <Icon type="logout" />
              <span>Logout</span>
            </Menu.Item>
          </Menu>
        }
        placement="bottomCenter"
        trigger={["click"]}>
        {profile.profileImage ? (
          <Button shape="circle" htmlType="button">
            <Avatar src={profile.profileImage} alt={profile.name} />
          </Button>
        ) : (
          <Button icon="user" shape="circle" htmlType="button" />
        )}
      </Dropdown>

      */
