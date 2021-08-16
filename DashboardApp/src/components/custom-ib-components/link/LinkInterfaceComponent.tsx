import React from "react"
import { BaseInterfaceComponent, Link, UserInterfaceContext, UserInterfaceContextManager } from "@opg/interface-builder"
import { linkManageForm } from "./link-manage-form"
import { LinkInterfaceComponentProps, LinkInterfaceComponentState } from "./types"
import { AdminUserInterfaceContext } from "../../../data/AdminUserInterfaceContextManager"

export class LinkInterfaceComponent extends BaseInterfaceComponent<
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  LinkInterfaceComponentProps,
  LinkInterfaceComponentState
> {
  constructor(props: LinkInterfaceComponentProps) {
    super(props)

    this.state = {
      linkLabel: "",
      uri: "",
    }
  }
  context!: React.ContextType<typeof AdminUserInterfaceContext>
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
  static defaultProps = {
    ...Link.LinkInterfaceComponent.defaultProps,
    useRouter: true,
  }
  static getLayoutDefinition = Link.LinkInterfaceComponent.getLayoutDefinition
  static manageForm = linkManageForm

  componentDidMount(): void {
    if (!this.context) {
      console.warn(
        "LinkInterfaceComponent",
        "String Template cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
    }
  }

  handleClick = (uri: string) => {
    if (this.props.useRouter && this.context) {
      // Wipe out userInterfaceData from this view so it doesn't conflict on the next view
      this.props.onChangeData && this.props.onChangeData({})
      this.context.navigation.navigate(uri)
    }
  }

  render() {
    return <Link.LinkInterfaceComponent {...this.props} onClick={this.handleClick} />
  }
}
