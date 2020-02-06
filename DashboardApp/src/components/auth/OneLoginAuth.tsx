import { Button, Icon } from "antd"
import React, { useState } from "react"
import { useRematch } from "../../hooks/use-rematch"

const OneLoginIcon = ({color = "currentColor"}) => (
  <i aria-label="icon: onelogin" className="anticon">
    <svg
      data-icon="onelogin"
      focusable="false"
      x="0"
      y="0"
      width="1em"
      height="1em"
      viewBox="0, 0, 36, 36"
      fill={color}
      aria-hidden="true">
      <path d="M18.001,0 C27.942,0 36.001,8.059 36.001,18 C36.001,27.941 27.942,36 18.001,36 C8.059,36 0,27.941 0,18 C0,8.059 8.059,0 18.001,0 z M20.248,12.326 L13.938,12.326 C13.598,12.326 13.428,12.495 13.428,12.835 L13.428,16.067 C13.428,16.407 13.598,16.577 13.938,16.577 L16.421,16.577 L16.421,24.37 C16.421,24.71 16.591,24.88 16.93,24.88 L20.162,24.88 C20.503,24.88 20.673,24.71 20.673,24.37 L20.673,12.75 C20.673,12.495 20.587,12.326 20.248,12.326 z" />
    </svg>
  </i>
)

export const OneLoginAuth = (): JSX.Element => {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [, dispatch] = useRematch((s) => null)
  const handleClick = () => {
    setIsSigningIn(true)
    dispatch.iam.authViaOneLoginOIDC()
  }

  return (
    <Button block={true} htmlType="button" loading={isSigningIn} onClick={handleClick}>
      {isSigningIn ? <OneLoginIcon color="transparent" /> : <OneLoginIcon />} Sign In With OneLogin
    </Button>
  )
}
