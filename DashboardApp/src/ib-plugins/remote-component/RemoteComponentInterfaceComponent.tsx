import { Alert, Collapse } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import React from "react"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { AdminUserInterfaceContext } from "../../data/AdminUserInterfaceContextManager"
import { remoteComponentManageForm } from "./remote-component-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentRenderer,
  UserInterfaceContext,
  UserInterfaceContextManager,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { isPlainObject } from "lodash/fp"
import layoutDefinition from "./layoutDefinition"

export interface RemoteComponentInterfaceComponentProps extends ComponentDefinitionNamedProps {
  collapsible?: boolean
  component: "remote-component"
  header?: string
  indented?: boolean
  remoteId: PersistedConfig["id"]
  onChangeData: UserInterfaceProps["onChangeData"]
  startCollapsed?: boolean
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  valueKey?: string
  mode: UserInterfaceProps["mode"]
  modeOverride: UserInterfaceProps["mode"]
}

export default class RemoteComponentInterfaceComponent extends BaseInterfaceComponent<RemoteComponentInterfaceComponentProps> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "values",
  }

  static getLayoutDefinition() {
    return layoutDefinition
  }

  static manageForm = remoteComponentManageForm
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
  context!: React.ContextType<typeof AdminUserInterfaceContext>

  handleChange = (newData: UserInterfaceProps["data"]): void => {
    if (this.props.valueKey && this.props.valueKey.length > 0) {
      this.setValue([this.props.valueKey, newData])
      return
    }
    // No valueKey, so try to merge data at the local root
    if (isPlainObject(newData)) {
      this.setValue(["$", newData])
    }
  }

  render(): JSX.Element {
    const {
      collapsible,
      header,
      indented,
      remoteId,
      startCollapsed,
      userInterfaceData,
      getRootUserInterfaceData,
      onChangeRootData,
      valueKey,
    } = this.props

    /*
     * NO CONTEXT ERROR
     */
    if (!this.context) {
      return <Alert type="warning" message="Remote Component is missing a context" />
    }

    const data = (valueKey ? this.getValue(valueKey) : userInterfaceData) || {}
    const remoteConfig = this.context.loadById(remoteId)

    /*
     * NO REMOTE CONFIG ERROR
     */
    if (!remoteConfig) {
      return <Alert type="warning" message={`Remote Component does not have a configuration`} />
    }

    const layout = tryCatch(() => JSON5.parse(remoteConfig.config.getOrElse("")).layout).toNullable()

    /*
     * NO LAYOUT ERROR
     */
    if (!Array.isArray(layout)) {
      return <Alert type="warning" message={`Remote Component ${remoteConfig.name} does not have a layout`} />
    }

    const content = (
      <div style={this.props.mode === "edit" ? { pointerEvents: "none", margin: "3px 1px 3px 1px" } : undefined}>
        <ComponentRenderer
          components={layout}
          mode={this.props.modeOverride || "display"}
          data={data}
          getRootUserInterfaceData={getRootUserInterfaceData}
          onChangeRootData={onChangeRootData}
          onChangeData={this.handleChange}
          onChangeSchema={(newSchema) => {
            console.warn(
              "RemoteComponentInterfaceComponent.render",
              "TODO: Cannot alter schema inside ComponentRenderer in RemoteComponent",
              { newSchema }
            )
          }}
        />
        <div
          style={
            this.props.mode === "edit"
              ? {
                  position: "absolute",
                  border: "dashed 1px #adb5bd",
                  margin: "-2px -1px -2px -1px",
                  borderRadius: 5,
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgb(255 255 255 / 50%)",
                }
              : undefined
          }
        />
      </div>
    )

    const wrappedContent = collapsible ? (
      <Collapse defaultActiveKey={startCollapsed ? [] : ["content"]}>
        <Collapse.Panel key="content" header={header}>
          {content}
        </Collapse.Panel>
      </Collapse>
    ) : (
      content
    )

    return <div style={{ marginLeft: indented ? 15 : 0 }}>{wrappedContent}</div>
  }
}
