import { Alert, Collapse } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { get, set } from "lodash/fp"
import React from "react"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { UserInterfaceContext } from "../../../UserInterfaceContextManager"
import { remoteComponentManageForm } from "./remote-component-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface RemoteComponentInterfaceComponentProps extends ComponentDefinitionNamedProps {
  collapsible?: boolean
  component: "remote-component"
  header?: string
  indented?: boolean
  remoteId: PersistedConfig["id"]
  onChangeData: UserInterfaceProps["onChangeData"]
  startCollapsed?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export class RemoteComponentInterfaceComponent extends BaseInterfaceComponent<
  RemoteComponentInterfaceComponentProps
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "value",
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
    onChangeData && onChangeData(set(valueKey, newData, userInterfaceData))
  }

  render(): JSX.Element {
    const {
      collapsible,
      header,
      indented,
      remoteId,
      startCollapsed,
      userInterfaceData,
      valueKey,
    } = this.props
    if (this.context) {
      const { loadById } = this.context
      const data = get(valueKey, userInterfaceData) || {}
      const remoteConfig = loadById(remoteId)
      if (remoteConfig) {
        const layout = tryCatch(
          () => JSON5.parse(remoteConfig.config.getOrElse("")).layout
        ).toNullable()
        if (Array.isArray(layout)) {
          const content = (
            <ComponentRenderer
              components={layout}
              data={data}
              onChangeData={this.handleChange}
              onChangeSchema={(newSchema) => {
                console.warn(
                  "RemoteComponentInterfaceComponent.render",
                  "TODO: Cannot alter schema inside ComponentRenderer in RemoteComponent",
                  { newSchema }
                )
              }}
            />
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
        } else {
          return (
            <Alert
              type="warning"
              message={`Remote Component ${remoteConfig.name} does not have a layout`}
            />
          )
        }
      }
    }

    return <Alert type="warning" message="No Remote Component Configured" />
  }
}
