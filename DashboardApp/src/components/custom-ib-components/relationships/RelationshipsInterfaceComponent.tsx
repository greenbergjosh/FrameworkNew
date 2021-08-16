import React from "react"
import { BaseInterfaceComponent, LayoutDefinition, UserInterfaceContext } from "@opg/interface-builder"
import { relationshipsManageForm } from "./relationships-manage-form"
import { RelationshipsInterfaceComponentProps, RelationshipsInterfaceComponentState } from "./types"
import { ExecuteInterfaceComponentProps, LoadStatusCode } from "../execute/types"
import { AdminUserInterfaceContext } from "../../../data/AdminUserInterfaceContextManager"
import { RelationshipTree } from "./RelationshipTree"

export class RelationshipsInterfaceComponent extends BaseInterfaceComponent<
  RelationshipsInterfaceComponentProps,
  RelationshipsInterfaceComponentState
> {
  constructor(props: ExecuteInterfaceComponentProps) {
    super(props)

    this.state = {
      configId: null,
    }
  }

  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Special",
      name: "relationships",
      title: "Relationships",
      icon: "deployment-unit",
      componentDefinition: {
        component: "relationships",
        hideLabel: true,
        components: [],
      },
    }
  }
  static manageForm = relationshipsManageForm
  static contextType = UserInterfaceContext
  static availableEvents: LoadStatusCode[] = []
  context!: React.ContextType<typeof AdminUserInterfaceContext>

  componentDidMount(): void {
    const configId = this.getValue(this.props.valueKey)
    if (configId && configId.length > 0) {
      this.setState({ configId })
    }
  }

  render(): JSX.Element {
    return <RelationshipTree configId={this.state.configId} linkPath={this.props.linkPath || ""} />
  }
}
