import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Spin,
  Typography
  } from "antd"
import Meta from "antd/lib/card/Meta"
import { WrappedFormInternalProps } from "antd/lib/form/Form"
import qs from "query-string"
import React from "react"
import { AppInfo, getgotServices, LoginResponse } from "../getgot-services"

export interface LoginFormProps extends WrappedFormInternalProps {}
export interface LoginFormState {
  findingApp: boolean
  requestingApp: null | AppInfo
  findingAppError: string | null

  error: string | null
  success: LoginResponse | null
  loading: boolean
}

class _LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  state = {
    findingApp: true,
    requestingApp: (null as any) as AppInfo,
    findingAppError: null,
    error: null,
    success: null,
    loading: false,
  }

  componentDidMount() {
    const appId = (qs.parse(window.location.search).appid || "") as string
    if (appId) {
      this.loadAppInfo(appId)
    } else {
      this.setState({ findingApp: false, findingAppError: "No App ID found!" })
    }

    const localStorageToken = localStorage.getItem("loginToken")

    if (localStorageToken) {
      this.retrieveProfile(localStorageToken)
    }
  }

  loadAppInfo = async (appId: string) => {
    getgotServices.fetchAppInfo(appId).then((appInfo) => {
      if (appInfo) {
        this.setState({ findingApp: false, requestingApp: appInfo })
      } else {
        this.setState({
          findingApp: false,
          findingAppError: `Failed to locate app for appId ${appId}`,
        })
        window.opener &&
          window.opener.postMessage(
            { error: `Failed to locate GetGot Affiliate with appId: ${appId}` },
            "*"
          )
      }
    })
  }

  retrieveProfile = async (token: string) => {
    const profile = await getgotServices.fetchProfile(token)

    console.log("Found profile", profile)
  }

  handleSubmit = (e: any) => {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({ error: null, loading: true })
        try {
          const result = await getgotServices.login(values.username, values.password)
          console.log("Results!", result)
          if (result.r !== 0) {
            console.error("Unsuccessful login attempt", result)
            this.setState({ error: result.err, success: null, loading: false })
          } else {
            this.setState({ error: null, success: result, loading: false })
          }
        } catch (ex) {
          console.error("Failed to execute login", ex)
          this.setState({ error: ex.message, success: null, loading: false })
        }
      }
    })
  }

  handleApprove = () => {
    const { requestingApp } = this.state
    if (requestingApp) {
      console.log("Posting message", this.state.success, "to", requestingApp.domain)
      localStorage.setItem("loginToken", (this.state.success || { t: "" }).t || "")
      window.opener &&
        window.opener.postMessage({ success: this.state.success }, requestingApp.domain)

      setTimeout(() => {
        window.close()
      }, 3000)
    }
  }

  handleCancel = () => {
    setTimeout(() => {
      window.close()
    }, 1000)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { findingApp, requestingApp, findingAppError } = this.state
    if (findingApp) {
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
          }}>
          <Spin size="large" tip="Connecting to GetGot" />
        </div>
      )
    } else if (findingAppError) {
      return (
        <Alert
          type="error"
          message={`Failed to find info on GetGot afilliate: ${findingAppError}`}
        />
      )
    }

    return this.state.success ? (
      <>
        <Card
          style={{ width: 350 }}
          title={
            this.state.success
              ? `Welcome, ${(this.state.success || ({} as any)).handle}!`
              : "Welcome!"
          }
          cover={
            requestingApp.image && (
              <img alt={`${requestingApp.name} logo`} src={requestingApp.image} />
            )
          }
          actions={[
            <Button onClick={this.handleCancel}>Cancel</Button>,
            <Button type="primary" onClick={this.handleApprove}>
              Authorize
            </Button>,
          ]}>
          <Meta
            // avatar={
            //   <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
            // }
            title={requestingApp.name}
            description={`Do you allow ${requestingApp.name} to create promotions in your GetGot account?`}
          />
        </Card>
      </>
    ) : (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <Typography.Title className="login-header">Log into GetGot</Typography.Title>
        <Form.Item>
          {getFieldDecorator("username", {
            rules: [{ required: true, message: "Username is required for login" }],
          })(
            <Input
              autoComplete="username"
              className="login-input"
              placeholder="Phone, email, or username"
              allowClear
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Password is required for login" }],
          })(
            <Input.Password
              autoComplete="current-password"
              className="login-input"
              placeholder="Password"
              allowClear
            />
          )}
        </Form.Item>
        {this.state.error && (
          <Alert
            message={this.state.error}
            type="error"
            closable
            onClose={() => this.setState({ error: null })}
          />
        )}
        <Form.Item>
          <div className="centered login-button-wrapper">
            <Button
              type="primary"
              className="login-button"
              htmlType="submit"
              loading={this.state.loading}>
              Log in
            </Button>
          </div>
        </Form.Item>
      </Form>
    )
  }
}

export const LoginForm = Form.create({ name: "login" })(_LoginForm)
