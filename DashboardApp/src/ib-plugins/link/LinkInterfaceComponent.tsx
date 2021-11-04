import React from "react"
import { BaseInterfaceComponent, UserInterfaceContext, UserInterfaceContextManager } from "@opg/interface-builder"
import Link from "@opg/interface-builder-plugins/lib/html/link/LinkInterfaceComponent"
import { linkManageForm } from "./link-manage-form"
import { LinkInterfaceComponentProps } from "./types"
import { AdminUserInterfaceContext } from "../../data/AdminUserInterfaceContextManager"

export default class LinkInterfaceComponent extends BaseInterfaceComponent<LinkInterfaceComponentProps> {
  context!: React.ContextType<typeof AdminUserInterfaceContext>
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
  static defaultProps = {
    useRouter: true,
  }
  static getLayoutDefinition = Link.getLayoutDefinition
  static manageForm = linkManageForm

  handleClick = (uri: string, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (this.props.useRouter && this.context) {
      // Wipe out userInterfaceData from this view so it doesn't conflict on the next view
      this.props.onChangeData && this.props.onChangeData({})
      this.context.navigation.navigate(uri)
    }
  }

  render() {
    return <Link {...this.props} onClick={this.handleClick} />
  }
}
