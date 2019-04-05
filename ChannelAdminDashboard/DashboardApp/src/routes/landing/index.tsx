import React from "react"
import { none, some } from "fp-ts/lib/Option"
import { Avatar, Button, Checkbox, Col, Divider, Form, Icon, Input, Layout, Row, Typography } from "antd"

import { HorizontalSpace } from "../../components/horizontal-space"
import { GoogleAuth } from "../../components/auth/GoogleAuth"

import { RouteProps } from "../../state/navigation"
import { useRematch } from "../../hooks/use-rematch"

import image from "../../images/go-get-em-coffee-mug.jpg"
import styles from "./landing.module.css"

interface Props extends RouteProps {}

export function Landing(props: Props) {
  const [{ iam }, dispatch] = useRematch((s) => ({
    iam: s.iam,
  }))

  const attemptLogin = React.useCallback(() => {
    dispatch.iam.update({ profile: some({ id: "123", name: "my dude" }) })
    dispatch.navigation.goToDashboard(none)
  }, [dispatch])

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
              {iam.profile.foldL(
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
                            prefix={
                              <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                            }
                            placeholder="Username"
                          />
                        </Form.Item>
                        <Form.Item>
                          <Input
                            prefix={
                              <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                            }
                            type="password"
                            placeholder="Password"
                          />
                        </Form.Item>
                        <Form.Item>
                          <Checkbox>Remember me</Checkbox>
                          <a className={styles.loginFormForgot} href="/">
                            Forgot password
                          </a>

                          <GoogleAuth />
                          Or <a href="/">register now!</a>
                        </Form.Item>
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

                      <HorizontalSpace size={25} />

                      <Row>
                        <div>
                          <Avatar size={200} icon="user" />
                        </div>

                        <HorizontalSpace size={25} />

                        <div>
                          <Typography.Text
                            className={styles.welcomeBackText}>{`Welcome back, ${
                            profile.name
                          }!`}</Typography.Text>
                        </div>
                      </Row>

                      <HorizontalSpace size={25} />

                      <Row>
                        <Button
                          block={true}
                          htmlType="button"
                          // TODO: remove coersion when `antd` release fix in next version
                          type={("primary" as unknown) as undefined}
                          onClick={() => dispatch.navigation.goToDashboard(none)}>
                          Go to your Insights Dashboard
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
