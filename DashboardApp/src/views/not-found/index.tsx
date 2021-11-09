import React from "react"
import { Helmet } from "react-helmet"
import { PageBeacon } from "../../components/PageBeacon"
import opgLogo from "../../images/on_point_tm_logo.svg"
import { Button } from "antd"
import { WithRouteProps } from "../../state/navigation"
import { LoginProps } from "../login"

export function NotFound(props: WithRouteProps<LoginProps>): JSX.Element {
  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignContent: "stretch",
        alignItems: "center",
      }}>
      <Helmet>
        <title>Page not found | Channel Admin | OPG</title>
      </Helmet>
      <div>
        <img alt="OnPoint Global" src={opgLogo} height={46} />
        <h2
          style={{
            fontSize: 40,
            color: "#272727",
            fontWeight: 300,
            margin: "40px auto 20px",
          }}>
          Oops! That page can’t be found.
        </h2>
        <hr
          style={{
            margin: "0 0 30px 0",
            width: 90,
            height: 2,
            background: "#ff5a00",
            border: 0,
          }}
        />
        <p
          style={{
            fontSize: 18,
            color: "#272727",
            lineHeight: "30px",
            fontWeight: "bold",
            marginBottom: 16,
          }}>
          Error 404
        </p>
        <p
          style={{
            fontSize: 18,
            color: "#272727",
            lineHeight: "30px",
            fontWeight: 300,
            marginBottom: 40,
          }}>
          It looks like nothing was found at this location.
        </p>
        <Button
          type="primary"
          size="large"
          onClick={() => props.navigate("/")}
          shape="round"
          style={{
            marginBottom: 60,
            backgroundColor: "#fe5c00",
            borderColor: "#fe5c00",
          }}>
          Back to home page
        </Button>
      </div>

      <PageBeacon
        data={{
          reportId: null,
          appName: null,
          pageTitle: "Not Found",
        }}
        pageReady={true}
      />
    </div>
  )
}
