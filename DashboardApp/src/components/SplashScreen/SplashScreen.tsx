import { Helmet } from "react-helmet"
import styles from "./styles.module.scss"
import { Icon } from "antd"
import React from "react"
import opgLogo from "../../images/on_point_tm_logo.svg"

interface SplashScreenProps {
  title?: string
}

export function SplashScreen({ title }: SplashScreenProps): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Loading... | Channel Admin | OPG</title>
      </Helmet>

      <div className={styles.splashScreen}>
        <Icon type="loading" title={title} />
        <img alt="OnPoint Global" src={opgLogo} />
        <div style={{ marginTop: 24 }}>{title}</div>
      </div>
    </>
  )
}
