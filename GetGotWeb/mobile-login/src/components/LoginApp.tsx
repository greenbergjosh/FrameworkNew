import { Layout } from "antd"
import React from "react"
import { LoginForm } from "./LoginForm"

const { Header, Content } = Layout

export const LoginApp = () => (
  <Layout>
    <Header className="brand-primary-block centered">
      <img src="logo-block.png" />
    </Header>
    <Layout>
      <Content
        style={{
          padding: 24,
          background: "#fff",
          fontFamily: "SF Text",
          minHeight: 280,
        }}>
        <LoginForm />
      </Content>
    </Layout>
  </Layout>
)
