import React from "react"
import { devToolsManageForm } from "./dev-tools-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { DevToolsInterfaceComponentProps, DevToolsInterfaceComponentState } from "./types"
import JSONEditor from "./components/JSONEditor"
import { Button } from "antd"

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
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition() {
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

  componentDidMount(): void {}

  componentDidUpdate(prevProps: Readonly<DevToolsInterfaceComponentProps>): void {
    // const prevValue = get(prevProps.valueKey, prevProps.userInterfaceData)
    // const nextValue = get(this.props.valueKey, this.props.userInterfaceData)
  }

  handleChange = (userInterfaceData: any) => {
    const { onChangeData } = this.props
    onChangeData && onChangeData(userInterfaceData)
  }

  render() {
    const { userInterfaceData, height } = this.props

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
          <JSONEditor data={userInterfaceData} onChange={this.handleChange} height={height} />
        )}
      </div>
    )
  }
}
