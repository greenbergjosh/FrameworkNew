import * as Reach from "@reach/router"
import { Avatar, Button, Col, Divider, Form, Icon, Input, Layout, Row, Typography } from "antd"
import { none } from "fp-ts/lib/Option"
import React from "react"
import { Helmet } from "react-helmet"
import { GoogleAuth } from "../../components/GoogleAuth"
import { OneLoginAuth } from "../../components/OneLoginAuth"
import { Space } from "../../components/space"
import { useRematch } from "../../hooks/use-rematch"
import image from "./go-get-em-coffee-mug.jpg"
import styles from "./landing.module.css"
import { WithRouteProps } from "../../state/navigation"
import { PageBeacon } from "../../components/PageBeacon"

export interface LandingProps {
  location: {
    state?: {
      redirectedFrom?: string
    }
  }
}

export function Landing(props: WithRouteProps<LandingProps>): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    iam: appState.iam,
    routes: appState.navigation.routes,
  }))

  React.useEffect(
    function handleDidLogin() {
      if (fromStore.iam.profile.isSome()) {
        if (props.location.state && props.location.state.redirectedFrom) {
          props.navigate(props.location.state.redirectedFrom)
        } else {
          dispatch.navigation.goToDashboard(none)
        }
      }
    },
    [dispatch.navigation, fromStore.iam.profile, fromStore.routes.dashboard.abs, props]
  )

  const [formState, setFormState] = React.useState({ user: "", password: "" })

  return (
    <Layout className={styles.fullHeight} hasSider={true}>
      <Layout.Content>
        <Row className={styles.fullHeight}>
          <Col className={styles.fullHeight} xs={0} md={12} lg={16}>
            <img className={styles.image} src={image} alt="a mug of hot coffee showing the words 'Go get em'" />
          </Col>

          <Col className={styles.fullHeight} xs={24} md={12} lg={8}>
            <Layout className={styles.fullHeight}>
              {fromStore.iam.profile.foldL(
                () => (
                  <Layout.Content className={styles.sidebarRightContent}>
                    <Helmet>
                      <title>Sign in | Channel Admin | OPG</title>
                    </Helmet>

                    <Row>
                      <Typography.Title level={1} className={styles.title}>
                        ONPOINT ADMIN
                      </Typography.Title>
                    </Row>

                    <Row>
                      <Form
                        onSubmit={(evt) => {
                          evt.preventDefault()
                          dispatch.iam.authViaBasicAuth(formState)
                        }}
                        className={styles.loginFormArea}>
                        <Form.Item>
                          <Input
                            onChange={(evt) => setFormState({ ...formState, user: evt.target.value })}
                            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                            placeholder="Username"
                            value={formState.user}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Input
                            onChange={(evt) => setFormState({ ...formState, password: evt.target.value })}
                            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                            type="password"
                            placeholder="Password"
                            value={formState.password}
                          />
                        </Form.Item>
                        <Form.Item />
                        <Button block={true} htmlType="submit" icon="login" type="primary">
                          Sign In
                        </Button>
                      </Form>
                    </Row>

                    <Divider dashed={false}>
                      <Typography.Text type="secondary">OR</Typography.Text>
                    </Divider>

                    <Row>
                      <GoogleAuth />
                      <Space.Horizontal height={25} />
                      <OneLoginAuth />
                    </Row>
                  </Layout.Content>
                ),
                // ------------------------------
                (profile) => (
                  <Layout.Content className={styles.sidebarRightContent}>
                    <Helmet>
                      <title>Welcome Back | Channel Admin | OPG</title>
                    </Helmet>

                    <Layout.Content className={styles.welcomeBackArea}>
                      <Row>
                        <Typography.Title level={1} className={styles.title}>
                          ONPOINT ADMIN
                        </Typography.Title>
                      </Row>

                      <Space.Horizontal height={25} />

                      <Row>
                        <div>
                          <Avatar size={200} icon="user" />
                        </div>

                        <Space.Horizontal height={25} />

                        <div>
                          <Typography.Text
                            className={styles.welcomeBackText}>{`Welcome back, ${profile.Name}!`}</Typography.Text>
                        </div>
                      </Row>

                      <Space.Horizontal height={25} />

                      <Row>
                        <Button
                          block={true}
                          htmlType="button"
                          type="primary"
                          onClick={() => dispatch.navigation.goToDashboard(none)}>
                          <Reach.Link to="/dashboard">Go to your Dashboard</Reach.Link>
                        </Button>
                      </Row>
                    </Layout.Content>
                  </Layout.Content>
                )
              )}
            </Layout>
          </Col>
        </Row>
      </Layout.Content>
      <PageBeacon
        data={{
          reportId: null,
          appName: null,
          pageTitle: "Login",
        }}
        pageReady={true}
      />
    </Layout>
  )
}

export default Landing
