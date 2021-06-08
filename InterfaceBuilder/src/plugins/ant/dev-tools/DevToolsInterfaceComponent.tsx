import React from "react"
import { devToolsManageForm } from "./dev-tools-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DevToolsInterfaceComponentProps, DevToolsInterfaceComponentState } from "./types"
import { JSONEditor } from "../../../components/JSONEditor/JSONEditor"
import { Button } from "antd"
import { LayoutDefinition } from "../../../globalTypes"
import { JSONEditorProps } from "../../../components/JSONEditor/types"

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
        <Button.Group size="small">
          <Button disabled type="ghost">
            Dev Tools:
          </Button>
          <Button
            type="primary"
            icon="database"
            onClick={() => this.setState({ showDataViewer: !this.state.showDataViewer })}>
            UI Data
          </Button>
        </Button.Group>
        {this.state.showDataViewer && (
          <JSONEditor data={data} onChange={this.handleChange} height={this.props.height} />
        )}
      </div>
    )
  }
}
