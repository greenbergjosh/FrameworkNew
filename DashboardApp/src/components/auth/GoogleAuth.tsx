import React, { useCallback, useEffect } from "react"
import { useRematch } from "../../hooks/use-rematch"
import { Avatar, Button, Dropdown, Icon, Menu } from "antd"
import { none, some } from "fp-ts/lib/Option"

const GOOGLE_AUTH_CONFIG = {
  clientId: "427941496558-cinvoa6vcatjc6ckabmkjbip17ggp8rh.apps.googleusercontent.com",
  scope: "profile email",
}

const gAPI = () => window.gapi
const gAuth = () => gAPI().auth2.getAuthInstance()
const onSignInClick = () => gAuth().signIn()
const onSignOutClick = () => gAuth().signOut()
const extractUserFromProfile = (googleAuthUser: gapi.auth2.GoogleUser) => {
  const profile = googleAuthUser.getBasicProfile()

  return {
    id: profile.getId(),
    name: profile.getName(),
    givenName: profile.getGivenName(),
    familyName: profile.getFamilyName(),
    imageUrl: profile.getImageUrl(),
    email: profile.getEmail(),
  }
}

export const GoogleAuth = (): JSX.Element => {
  const [{ iam }, dispatch] = useRematch((s) => ({
    iam: s.iam,
  }))

  const onAuthChange = useCallback((signedIn: boolean) => {
    if (signedIn) {
      const user = extractUserFromProfile(gAuth().currentUser.get())

      dispatch.iam.update({ profile: some(user) })
      dispatch.navigation.goToDashboard(none)
    } else {
      dispatch.iam.reset()
      dispatch.navigation.goToLanding(none)
    }
  }, [dispatch.iam, dispatch.navigation])

  useEffect(
    () =>
      // Load the Google API for auth
      gAPI().load("client:auth2", () =>
        // When it's loaded, grab the GAuth client
        gAPI()
          .client // Initialize with our config
          .init(GOOGLE_AUTH_CONFIG)
          // Once we're set up for Google Auth
          .then(() => {
            // Send the current state to rematch
            onAuthChange(gAuth().isSignedIn.get())
            // Listen for any changes to the signed in status, refire to rematch
            gAuth().isSignedIn.listen(onAuthChange)
          })
      ),
    [onAuthChange]
  )

  return iam.profile.foldL(
    // Fold / None case (No user profile)
    () => (
      <Button block={true} htmlType="button" icon="google" onClick={onSignInClick}>
        Sign In With Google
      </Button>
    ),

    // Fold / Some case (Has user profile)
    (profile) => (
        <Dropdown
          overlay={
            <Menu
              onClick={({ key }) => (key === "logout" ? onSignOutClick() : (e: React.SyntheticEvent) => e.preventDefault())}>
              <Menu.Item key="username">
                <span>{profile.name}</span>
              </Menu.Item>
              <Menu.Item key="email">
                <Icon type="mail" />
                <span><i>{profile.email}</i></span>
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
          {profile.imageUrl ? (
            <Button shape="circle" htmlType="button">
              <Avatar src={profile.imageUrl} alt={profile.name} />
            </Button>
          ) : (
            <Button icon="user" shape="circle" htmlType="button" />
          )}
        </Dropdown>
      )
  )
}
