import React from "react"
import { BaseInterfaceComponent, UserInterfaceContext } from "@opg/interface-builder"
import { executeManageForm } from "./execute-manage-form"
import {
  ExecuteInterfaceComponentProps,
  ExecuteInterfaceComponentState,
  ExecuteRemoteConfigInterfaceComponentProps,
  ExecuteRemoteQueryInterfaceComponentProps,
  ExecuteRemoteUrlInterfaceComponentProps,
  OnMountType,
} from "./types"
import RemoteConfig from "./components/RemoteConfig/RemoteConfig"
import RemoteQuery from "./components/RemoteQuery/RemoteQuery"
import RemoteUrl from "./components/RemoteUrl/RemoteUrl"
import { Empty, Icon } from "antd"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { JSONRecord } from "../../../data/JSON"
import { AdminUserInterfaceContext } from "../../../data/AdminUserInterfaceContextManager"

export class ExecuteInterfaceComponent extends BaseInterfaceComponent<
  ExecuteInterfaceComponentProps,
  ExecuteInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }
  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "execute",
      title: "Execute",
      icon: "thunderbolt",
      componentDefinition: {
        component: "execute",
        hideLabel: true,
        components: [],
      },
    }
  }
  static manageForm = executeManageForm
  static contextType = UserInterfaceContext
  static availableEvents = [
    "remoteQuery_loaded",
    "remoteConfig_created",
    "remoteConfig_updated",
    "remoteConfig_deleted",
    "remoteConfig_loaded",
    "remoteUrl_loaded",
  ]
  context!: React.ContextType<typeof AdminUserInterfaceContext>
  autoExecuteTimer?: ReturnType<typeof setInterval> | null

  constructor(props: ExecuteInterfaceComponentProps) {
    super(props)

    this.state = {
      data: [],
      formState: {},
      loadError: null,
      loadStatus: "none",
      submittingQueryForm: false,
      transientParams: {},
    }
  }

  /**
   * Public method for external clients to trigger a submit
   * @public
   * @param transientParams
   */
  public submit(transientParams: JSONRecord = {}): void {
    console.log("ExecuteInterfaceComponent", "submit")
    this.setState({ submittingQueryForm: true, transientParams })
  }

  /* ******************************************
   *
   * EVENT HANDLERS
   */

  componentWillUnmount(): void {
    if (this.autoExecuteTimer) {
      clearInterval(this.autoExecuteTimer)
      this.autoExecuteTimer = null
    }
  }

  /**
   * Start the auto execute timer when the QueryForm mounts
   * @param handleSubmit
   */
  private handleQueryFormMount: OnMountType = (handleSubmit) => {
    if (!this.props.executeImmediately || this.props.mode === "edit") {
      return
    }
    if (this.props.autoExecuteIntervalSeconds) {
      const ms = this.props.autoExecuteIntervalSeconds * 1000
      this.autoExecuteTimer = setInterval(handleSubmit, ms)
    }
    return handleSubmit()
  }

  /**
   * Setter method for children to trigger a submit
   * @param submitting
   */
  private setParentSubmitting = (submitting: boolean) => {
    this.setState({ submittingQueryForm: submitting })
  }

  private handleRaiseEvent = (eventName: string, eventPayload: any): void => {
    this.raiseEvent(eventName, eventPayload)
  }

  private getParamsFromParamKVPMaps = (): JSONRecord => {
    const { paramKVPMaps, userInterfaceData } = this.props
    if (!paramKVPMaps || !paramKVPMaps.values || !paramKVPMaps.values.reduce) {
      return { ...userInterfaceData, ...this.state.transientParams }
    }
    const params = paramKVPMaps.values.reduce((acc, item) => {
      const val = this.getValue(item.valueKey)
      if (val) acc[item.fieldName] = val
      return acc
    }, {} as JSONRecord)
    return { ...userInterfaceData, ...params, ...this.state.transientParams }
  }

  /* ******************************************
   *
   * RENDER METHOD
   */

  getQueryStrategy(): JSX.Element {
    const {
      buttonLabel,
      buttonProps,
      onChangeData,
      outboundValueKey,
      remoteQuery,
      remoteUrl,
      userInterfaceData,
      queryType,
    } = this.props
    let castProps

    switch (queryType) {
      case "remote-config":
        castProps = this.props as ExecuteRemoteConfigInterfaceComponentProps
        return (
          <RemoteConfig
            actionType={castProps.RemoteConfig_actionType}
            buttonLabel={buttonLabel}
            buttonProps={buttonProps}
            deleteRedirectPath={castProps.RemoteConfig_deleteRedirectPath}
            entityTypeId={castProps.RemoteConfig_entityTypeId}
            getParams={this.getParamsFromParamKVPMaps}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            mode={this.props.mode}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submittingQueryForm}
            remoteConfigStaticId={castProps.RemoteConfig_staticId}
            resultsType={castProps.RemoteConfig_resultsType}
            setParentSubmitting={this.setParentSubmitting}
            useDeleteRedirect={castProps.RemoteConfig_useDeleteRedirect}
            userInterfaceData={userInterfaceData}
          />
        )
      case "remote-query":
        castProps = this.props as ExecuteRemoteQueryInterfaceComponentProps
        return (
          <RemoteQuery
            buttonLabel={buttonLabel}
            buttonProps={buttonProps}
            executeQuery={this.context!.executeQuery}
            executeQueryUpdate={this.context!.executeQueryUpdate}
            getParams={this.getParamsFromParamKVPMaps}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            isCRUD={castProps.RemoteQuery_isCRUD}
            loadById={this.context!.loadById}
            mode={this.props.mode}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submittingQueryForm}
            queryConfigId={remoteQuery as PersistedConfig["id"]}
            reportDataByQuery={this.context!.reportDataByQuery}
            setParentSubmitting={this.setParentSubmitting}
            userInterfaceData={userInterfaceData}
          />
        )
      case "remote-url":
        castProps = this.props as ExecuteRemoteUrlInterfaceComponentProps
        return (
          <RemoteUrl
            buttonLabel={buttonLabel}
            buttonProps={buttonProps}
            executeHTTPRequestQuery={this.context!.executeHTTPRequestQuery}
            getParams={this.getParamsFromParamKVPMaps}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            isCRUD={castProps.RemoteUrl_isCRUD}
            loadById={this.context!.loadById}
            mode={this.props.mode}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submittingQueryForm}
            queryConfigId={remoteUrl as PersistedConfig["id"]}
            reportDataByQuery={this.context!.reportDataByQuery}
            setParentSubmitting={this.setParentSubmitting}
            userInterfaceData={userInterfaceData}
          />
        )
      default:
        return (
          <Empty
            description="Please configure a Data Source for this Execute component"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )
    }
  }

  render(): JSX.Element {
    const diagnosticsPanelStyle = !this.props.invisible
      ? {
          padding: 10,
          border: "1px dashed rgba(0, 178, 255, 0.5)",
          backgroundColor: "rgba(0, 178, 255, 0.05)",
          borderRadius: 5,
          color: "rgb(172 177 180)",
          fontSize: 10,
          display: "inline-block",
        }
      : {
          fontSize: 10,
        }

    if (this.props.mode === "edit") {
      return (
        <>
          <div style={diagnosticsPanelStyle}>
            <div>Execute</div>
            <div>
              <strong>Type:</strong> {this.props.queryType}
            </div>
            <div>
              <strong>Outbound Value Key:</strong> {this.props.outboundValueKey}
            </div>
            {this.props.executeImmediately && (
              <div>
                <Icon type="check-square" /> <strong>Execute Immediately</strong>
              </div>
            )}
          </div>
          {this.getQueryStrategy()}
        </>
      )
    }
    return this.getQueryStrategy()
  }
}
