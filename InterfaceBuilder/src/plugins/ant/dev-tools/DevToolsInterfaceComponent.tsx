import React from "react"
import { devToolsManageForm } from "./dev-tools-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DevToolsInterfaceComponentProps, DevToolsInterfaceComponentState } from "./types"
import { JSONEditor } from "../../../components/JSONEditor/JSONEditor"
import { Button, Tooltip } from "antd"
import { LayoutDefinition } from "../../../globalTypes"
import { JSONEditorProps } from "../../../components/JSONEditor/types"
import styles from "./styles.scss"
import classNames from "classnames"

export class DevToolsInterfaceComponent extends BaseInterfaceComponent<
  DevToolsInterfaceComponentProps,
  DevToolsInterfaceComponentState
> {
  constructor(props: DevToolsInterfaceComponentProps) {
    super(props)

    this.state = {
      showDataViewer: false,
    }
  }

  static defaultProps = {
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Special",
      name: "dev-tools",
      title: "Dev Tools",
      icon: "setting",
      description: ``,
      componentDefinition: {
        component: "dev-tools",
        components: [],
      },
    }
  }

  static manageForm = devToolsManageForm

  handleChange: JSONEditorProps["onChange"] = (data): void => {
    this.setValue([this.props.valueKey, data || {}])
  }

  render(): JSX.Element {
    const data = this.getValue(this.props.valueKey) || {}

    return (
      <div>
        <Tooltip title="Data Visualizer">
          <Button
            type="link"
            icon="setting"
            size="small"
            className={classNames(styles.button, this.state.showDataViewer ? styles.active : null)}
            onClick={() => this.setState({ showDataViewer: !this.state.showDataViewer })}
          />
        </Tooltip>
        {this.state.showDataViewer && (
          <div className={styles.visualizer}>
            <JSONEditor data={data} onChange={this.handleChange} height={this.props.height} />
          </div>
        )}
      </div>
    )
  }
}
