import { Alert, Collapse } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { get, set } from "lodash/fp"
import React from "react"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { remoteComponentManageForm } from "./remote-component-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentRenderer,
  UserInterfaceContext,
  UserInterfaceProps,
} from "@opg/interface-builder"

export interface RemoteComponentInterfaceComponentProps extends ComponentDefinitionNamedProps {
  collapsible?: boolean
  component: "remote-component"
  header?: string
  indented?: boolean
  remoteId: PersistedConfig["id"]
  onChangeData: UserInterfaceProps["onChangeData"]
  startCollapsed?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  valueKey?: string
  mode: UserInterfaceProps["mode"]
}

export class RemoteComponentInterfaceComponent extends BaseInterfaceComponent<RemoteComponentInterfaceComponentProps> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "values",
  }

  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "remote-component",
      title: "Remote Component",
      icon: "select",
      componentDefinition: {
        component: "remote-component",
        label: "Remote Component",
      },
    }
  }

  static manageForm = remoteComponentManageForm
  static contextType = UserInterfaceContext
  context!: React.ContextType<typeof UserInterfaceContext>

  handleChange = (newData: any) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    if (onChangeData) {
      // If there's a valueKey, nest the data
      if (valueKey) {
        onChangeData(set(valueKey, newData, userInterfaceData))
      } else {
        // If there's not a valueKey, merge the data at the top level
        onChangeData({ ...userInterfaceData, ...newData })
      }
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
      setRootUserInterfaceData,
      valueKey,
    } = this.props
    if (this.context) {
      const { loadById } = this.context
      // If there is a valueKey, pull from the nested data
      const data = (valueKey ? get(valueKey, userInterfaceData) : userInterfaceData) || {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const remoteConfig = loadById(remoteId)

      if (remoteConfig) {
        if (remoteConfig.type === "App.Page") {
          return <Alert type="warning" message='Remote component must not be an "App.Page"' />
        }

        const layout = tryCatch(() => JSON5.parse(remoteConfig.config.getOrElse("")).layout).toNullable()
        if (Array.isArray(layout)) {
          const content = (
            <div style={this.props.mode === "edit" ? { pointerEvents: "none", margin: "3px 1px 3px 1px" } : undefined}>
              <ComponentRenderer
                components={layout}
                mode="display"
                data={data}
                getRootData={getRootUserInterfaceData}
                setRootData={setRootUserInterfaceData}
                onChangeData={this.handleChange}
                onChangeSchema={(newSchema: any) => {
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
        return <Alert type="warning" message={`Remote Component ${remoteConfig.name} does not have a layout`} />
      }
    }

    return <Alert type="warning" message="No Remote Component Configured" />
  }
}
