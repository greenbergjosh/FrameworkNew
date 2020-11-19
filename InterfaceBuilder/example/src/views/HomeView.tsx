import { Card, Icon, Layout, PageHeader, Row, Col, Typography } from "antd"
import React from "react"
import { Helmet } from "react-helmet"

export const HomeView: React.FC = (): JSX.Element => {
  return (
    <>
      <Helmet>
        <title>InterfaceBuilder.js</title>
      </Helmet>
      <Layout.Content>
        <Row style={{ backgroundColor: "#702eff", height: 300 }} type={"flex"} justify="center">
          <Col>
            <Typography>
              <Typography.Title
                style={{
                  fontSize: 50,
                  color: "white",
                  textAlign: "center",
                  fontWeight: 400,
                  margin: 0,
                  marginTop: 100,
                }}>
                <Icon type="setting" /> InterfaceBuilder.js
              </Typography.Title>
              <Typography.Title
                level={3}
                style={{
                  fontSize: 24,
                  color: "white",
                  textAlign: "center",
                  fontWeight: 300,
                  fontStyle: "italic",
                  margin: 0,
                  marginTop: 10,
                }}>
                Ut enim ad minima veniam, quis nostrum
              </Typography.Title>
            </Typography>
          </Col>
        </Row>
        <Row
          style={{
            backgroundColor: "#fffbea",
            paddingTop: 40,
            paddingBottom: 20,
          }}
          type={"flex"}
          justify={"space-around"}>
          <Col span={6}>
            <Typography>
              <Typography.Title level={3} type="secondary">
                <Icon
                  type="edit"
                  style={{
                    display: "block",
                    fontSize: 40,
                    marginLeft: -50,
                    marginBottom: 20,
                    color: "lightgrey",
                  }}
                />
                Config-Driven
              </Typography.Title>
              <Typography.Paragraph type="secondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
              </Typography.Paragraph>
            </Typography>
          </Col>
          <Col span={6}>
            <Typography>
              <Typography.Title level={3} type="secondary">
                <Icon
                  type="build"
                  style={{
                    display: "block",
                    fontSize: 40,
                    marginLeft: -50,
                    marginBottom: 20,
                    color: "lightgrey",
                  }}
                />
                Composable
              </Typography.Title>
              <Typography.Paragraph type="secondary">
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </Typography.Paragraph>
            </Typography>
          </Col>
          <Col span={6}>
            <Typography>
              <Typography.Title level={3} type="secondary">
                <Icon
                  type="api"
                  style={{
                    display: "block",
                    fontSize: 40,
                    marginLeft: -50,
                    marginBottom: 20,
                    color: "lightgrey",
                  }}
                />
                Extensible
              </Typography.Title>
              <Typography.Paragraph type="secondary">
                Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
                molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
              </Typography.Paragraph>
            </Typography>
          </Col>
        </Row>
        <Row
          type={"flex"}
          justify={"space-around"}
          style={{
            paddingTop: 30,
            paddingBottom: 20,
            backgroundColor: "white",
          }}>
          <Col span={22}>
            <Typography.Title
              level={3}
              type={"secondary"}
              style={{
                fontWeight: 300,
              }}>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </Typography.Title>
          </Col>
        </Row>
        <Row
          type={"flex"}
          justify={"space-around"}
          style={{
            paddingBottom: 20,
            backgroundColor: "white",
          }}>
          <Col span={10}>
            <div
              style={{
                backgroundColor: "lightgrey",
                height: 200,
                width: "100%",
                marginBottom: 20,
                color: "grey",
                lineHeight: "100px",
                textAlign: "center",
              }}>
              Diagram
            </div>
            <Typography.Paragraph type={"secondary"}>
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
              molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
              molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
            </Typography.Paragraph>
          </Col>
          <Col span={10}>
            <Typography.Paragraph type={"secondary"}>
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
              molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
              molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
            </Typography.Paragraph>
            <Typography.Paragraph type={"secondary"}>
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
              molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
              molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
              molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row
          type={"flex"}
          justify={"space-around"}
          style={{
            paddingTop: 20,
            paddingBottom: 20,
            backgroundColor: "white",
          }}>
          <Col span={22} style={{ borderTop: "solid 1px lightgrey", paddingTop: 20 }}>
            <Typography.Paragraph type={"secondary"}>
              ISC © <a href="https://onpointglobal.com/">OnPoint Global</a>
            </Typography.Paragraph>
          </Col>
        </Row>
      </Layout.Content>
    </>
  )
}
