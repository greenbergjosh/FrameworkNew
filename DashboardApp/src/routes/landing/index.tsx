import * as Reach from "@reach/router"
import { none, some } from "fp-ts/lib/Option"
import React from "react"
import { GoogleAuth } from "../../components/auth/GoogleAuth"
import { Space } from "../../components/space"
import { useRematch } from "../../hooks/use-rematch"
import image from "../../images/go-get-em-coffee-mug.jpg"
import { WithRouteProps } from "../../state/navigation"
import styles from "./landing.module.css"
import {
  Avatar,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Icon,
  Input,
  Layout,
  Row,
  Typography,
} from "antd"

interface Props {
  location: {
    state: {
      redirectedFrom?: string
    }
  }
}

export function Landing(props: WithRouteProps<Props>, ...args: any[]) {
  console.log("Landing", props.location.state, props, args)
  const [fromStore, dispatch] = useRematch((s) => ({
    iam: s.iam,
    routes: s.navigation.routes,
  }))

  const attemptLogin = React.useCallback(() => {
    // dispatch.iam.update({ profile: some({ id: "123", name: "my dude" }) })
    if (props.location.state.redirectedFrom) {
      props.navigate(props.location.state.redirectedFrom)
    } else {
      dispatch.navigation.goToDashboard(none)
    }
  }, [dispatch])

  React.useEffect(() => {
    if (fromStore.iam.profile.isSome()) {
      props.navigate(fromStore.routes.dashboard.abs)
    }
  }, [fromStore.iam.profile])

  return (
    <Layout className={styles.fullHeight} hasSider={true}>
      <Layout.Content>
        <Row className={styles.fullHeight}>
          <Col className={styles.fullHeight} xs={0} md={12} lg={16}>
            <img
              className={styles.image}
              src={image}
              alt="a mug of hot coffee showing the words 'Go get em'"
            />
          </Col>

          <Col className={styles.fullHeight} xs={24} md={12} lg={8}>
            <Layout className={styles.fullHeight}>
              {fromStore.iam.profile.foldL(
                () => (
                  <Layout.Content className={styles.sidebarRightContent}>
                    <Row>
                      <Typography.Title level={1} className={styles.title}>
                        ONPOINT CONSOLE
                      </Typography.Title>
                    </Row>

                    <Row>
                      <Form
                        onSubmit={(evt) => {
                          evt.preventDefault()
                          alert("Not implemented")
                        }}
                        className={styles.loginFormArea}>
                        <Form.Item>
                          <Input
                            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                            placeholder="Username"
                          />
                        </Form.Item>
                        <Form.Item>
                          <Input
                            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                            type="password"
                            placeholder="Password"
                          />
                        </Form.Item>
                        <Form.Item />
                        <Button
                          block={true}
                          htmlType="button"
                          icon="login"
                          type="primary"
                          onClick={attemptLogin}>
                          Sign In
                        </Button>
                      </Form>
                    </Row>

                    <Divider dashed={false}>
                      <Typography.Text type="secondary">OR</Typography.Text>
                    </Divider>

                    <Row>
                      <GoogleAuth />
                    </Row>
                  </Layout.Content>
                ),
                // ------------------------------
                (profile) => (
                  <Layout.Content className={styles.sidebarRightContent}>
                    <Layout.Content className={styles.welcomeBackArea}>
                      <Row>
                        <h1 className={styles.title}>INSIGHTS</h1>
                      </Row>

                      <Space.Horizontal height={25} />

                      <Row>
                        <div>
                          <Avatar size={200} icon="user" />
                        </div>

                        <Space.Horizontal height={25} />

                        <div>
                          <Typography.Text className={styles.welcomeBackText}>{`Welcome back, ${
                            profile.name
                          }!`}</Typography.Text>
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
    </Layout>
  )
}

export default Landing
