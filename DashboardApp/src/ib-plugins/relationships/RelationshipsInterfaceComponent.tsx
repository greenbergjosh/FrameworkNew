import React from "react"
import {
  BaseInterfaceComponent,
  LayoutDefinition,
  UserInterfaceContext,
  UserInterfaceContextManager,
} from "@opg/interface-builder"
import { settings } from "./settings"
import { RelationshipsInterfaceComponentProps, RelationshipsInterfaceComponentState } from "./types"
import { ExecuteInterfaceComponentProps, LoadStatusCode } from "../execute/types"
import { AdminUserInterfaceContext } from "../../data/AdminUserInterfaceContextManager"
import { RelationshipTree } from "./RelationshipTree"
import layoutDefinition from "./layoutDefinition"

export default class RelationshipsInterfaceComponent extends BaseInterfaceComponent<
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
    return layoutDefinition
  }
  static manageForm = settings
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
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
