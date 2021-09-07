import classNames from "classnames"
import React from "react"
import styles from "./styles.scss"
import { BaseInterfaceComponent, JSONEditor, JSONEditorProps, LayoutDefinition } from "@opg/interface-builder"
import { Button, Tooltip } from "antd"
import { DevToolsInterfaceComponentProps, DevToolsInterfaceComponentState } from "./types"
import { devToolsManageForm } from "./dev-tools-manage-form"
import layoutDefinition from "./layoutDefinition"

export default class DevToolsInterfaceComponent extends BaseInterfaceComponent<
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
    return layoutDefinition
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
