import * as Reach from "@reach/router"
import { Avatar, Button, Col, Layout, Row, Typography } from "antd"
import React from "react"
import { Helmet } from "react-helmet"
import { GoogleAuth } from "../../components/GoogleAuth"
import { OneLoginAuth } from "../../components/OneLoginAuth"
import { Space } from "./space"
import { useRematch } from "../../hooks/use-rematch"
import styles from "./login.module.scss"
import { WithRouteProps } from "../../state/navigation"
import { PageBeacon } from "../../components/PageBeacon"
import opgLogo from "../../images/on_point_tm_logo.svg"

export interface LoginProps {
  location: {
    state?: {
      redirectedFrom?: string
    }
  }
}

export function Login(props: WithRouteProps<LoginProps>): JSX.Element {
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
          props.navigate("/app/home")
        }
      }
    },
    [props.navigate, fromStore.iam.profile, props]
  )

  return (
    <Layout className={styles.fullHeight} hasSider={true}>
      <Layout.Content>
        <Row className={styles.fullHeight}>
          <Col className={styles.fullHeight} xs={0} md={12} lg={16}>
            <Layout className={styles.fullHeight}>
              <Layout.Content className={styles.brandingPanel}>
                <h5>ASSIST.</h5>
                <h5>ENABLE.</h5>
                <h5>EMPOWER.</h5>
                <h5>ACCOMPLISH.</h5>
                <h5>ACHIEVE.</h5>
              </Layout.Content>
            </Layout>
          </Col>

          <Col className={styles.fullHeight} xs={24} md={12} lg={8}>
            <Layout className={styles.fullHeight}>
              {fromStore.iam.profile.foldL(
                () => (
                  <Layout.Content className={styles.sidebarRightContent} style={{ backgroundColor: "white" }}>
                    <Helmet>
                      <title>Sign in | Channel Admin | OPG</title>
                    </Helmet>

                    <Row>
                      <div>
                        <img alt="OnPoint Global" src={opgLogo} width={150} style={{ marginBottom: 20 }} />
                      </div>
                      <p className={styles.portalTitle}>OnPoint Admin Portal</p>
                    </Row>

                    {/*<Row>*/}
                    {/*  <Form*/}
                    {/*    onSubmit={(evt) => {*/}
                    {/*      evt.preventDefault()*/}
                    {/*      dispatch.iam.authViaBasicAuth(formState)*/}
                    {/*    }}*/}
                    {/*    className={styles.loginFormArea}>*/}
                    {/*    <Form.Item>*/}
                    {/*      <Input*/}
                    {/*        onChange={(evt) => setFormState({ ...formState, user: evt.target.value })}*/}
                    {/*        prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}*/}
                    {/*        placeholder="Username"*/}
                    {/*        value={formState.user}*/}
                    {/*      />*/}
                    {/*    </Form.Item>*/}
                    {/*    <Form.Item>*/}
                    {/*      <Input*/}
                    {/*        onChange={(evt) => setFormState({ ...formState, password: evt.target.value })}*/}
                    {/*        prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}*/}
                    {/*        type="password"*/}
                    {/*        placeholder="Password"*/}
                    {/*        value={formState.password}*/}
                    {/*      />*/}
                    {/*    </Form.Item>*/}
                    {/*    <Form.Item />*/}
                    {/*    <Button block={true} htmlType="submit" icon="login" type="primary">*/}
                    {/*      Sign In*/}
                    {/*    </Button>*/}
                    {/*  </Form>*/}
                    {/*</Row>*/}

                    <Row>
                      <GoogleAuth />
                      <Space.Horizontal height={25} />
                      <OneLoginAuth />
                    </Row>
                    <Row className={styles.legalNotice}>
                      <strong>WARNING NOTICE:</strong> You are about to enter a private website that is restricted to
                      authorized use by employees and external agencies of OnPoint Global, LLC and its affiliates,
                      globally, for business purposes only. The actual or attempted unauthorized access, use or
                      modification of this website or its contents is strictly prohibited by OnPoint Global.
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
                        <Button block={true} htmlType="button" type="primary" onClick={() => props.navigate("/")}>
                          <Reach.Link to="/app/home">Go to the Dashboard</Reach.Link>
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

export default Login
