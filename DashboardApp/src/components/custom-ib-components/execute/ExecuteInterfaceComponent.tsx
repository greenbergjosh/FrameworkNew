import React from "react"
import { BaseInterfaceComponent, UserInterfaceContext } from "@opg/interface-builder"
import { executeManageForm } from "./execute-manage-form"
import {
  ExecuteInterfaceComponentProps,
  ExecuteInterfaceComponentState,
  ExecuteRemoteConfigInterfaceComponentProps,
  ExecuteRemoteQueryInterfaceComponentProps,
  ExecuteRemoteUrlInterfaceComponentProps,
  LoadStatusCode,
  LOADSTATUSCODES,
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
  static availableEvents: LoadStatusCode[] = [
    LOADSTATUSCODES.loading,
    LOADSTATUSCODES.loaded,
    LOADSTATUSCODES.created,
    LOADSTATUSCODES.updated,
    LOADSTATUSCODES.deleted,
    LOADSTATUSCODES.error,
  ]
  context!: React.ContextType<typeof AdminUserInterfaceContext>
  autoExecuteTimer?: ReturnType<typeof setInterval> | null

  constructor(props: ExecuteInterfaceComponentProps) {
    super(props)

    this.state = {
      data: [],
      formState: {},
      loadError: null,
      loadStatus: LOADSTATUSCODES.none,
      submitting: false,
      transientParams: {},
    }
  }

  /**
   * Public method for external clients to trigger a submit
   *
   * QueryForm.tsx contains the form that needs to be submitted. So we pass our "submitting" state
   * and "setSubmitting" setter through props to QueryForm. When submitting is set to true,
   * QueryForm's update lifecycle detects the change, submits its form, and resets submitting back to false.
   * See QueryForm.tsx useEffect hooks for submitting the form.
   *
   * @public
   * @param transientParams - Params passed from an LBM that are retained only during a single submit cycle.
   */
  public submit(transientParams: JSONRecord = {}): void {
    console.log("ExecuteInterfaceComponent", "submit")
    this.setState({ submitting: true, transientParams })
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
    if (this.props.mode === "preview") {
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
   *
   * QueryForm.tsx contains the form that needs to be submitted. So we pass our "submitting" state
   * and "setSubmitting" setter through props to QueryForm. When submitting is set to true,
   * QueryForm's update lifecycle detects the change, submits its form, and resets submitting back to false.
   * See QueryForm.tsx useEffect hooks for submitting the form.
   *
   * @param submitting
   */
  private setSubmitting = (submitting: boolean) => {
    this.setState({ submitting })
    if (!submitting) {
      // The submit cycle is done, so reset transientParams.
      this.setState({ transientParams: {} })
    }
  }

  private handleRaiseEvent = (eventName: string, eventPayload: any): void => {
    const { outboundLoadingKey, userInterfaceData } = this.props
    if (outboundLoadingKey) {
      const isLoading = eventName === "loading"
      this.setValue(outboundLoadingKey, isLoading, userInterfaceData)
    }
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

  private handleResults = (data: any) => {
    const { onChangeData, outboundValueKey, userInterfaceData } = this.props

    console.log("handleChangeData", { data })
    // onChangeData && onChangeData(set(outboundValueKey, data, userInterfaceData))
    this.setValue(outboundValueKey, data, userInterfaceData)
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
            mode={this.props.mode}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            onResults={this.handleResults}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submitting}
            remoteConfigStaticId={castProps.RemoteConfig_staticId}
            resultsType={castProps.RemoteConfig_resultsType}
            setParentSubmitting={this.setSubmitting}
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
            isCRUD={castProps.RemoteQuery_isCRUD}
            loadById={this.context!.loadById}
            mode={this.props.mode}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            onResults={this.handleResults}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submitting}
            queryConfigId={remoteQuery as PersistedConfig["id"]}
            reportDataByQuery={this.context!.reportDataByQuery}
            setParentSubmitting={this.setSubmitting}
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
            isCRUD={castProps.RemoteUrl_isCRUD}
            loadById={this.context!.loadById}
            mode={this.props.mode}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            onResults={this.handleResults}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submitting}
            queryConfigId={remoteUrl as PersistedConfig["id"]}
            reportDataByQuery={this.context!.reportDataByQuery}
            setParentSubmitting={this.setSubmitting}
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
          border: "1px dashed rgba(180, 0, 255, 0.5)",
          backgroundColor: "rgba(180, 0, 255, 0.05)",
          borderRadius: 5,
          color: "rgb(172 177 180)",
          fontSize: 10,
          display: "inline-block",
          width: "100%",
        }
      : {
          fontSize: 10,
        }

    if (this.props.mode === "edit") {
      return (
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
          <div
            style={{
              position: "relative",
              padding: 5,
              pointerEvents: "none",
            }}>
            {this.getQueryStrategy()}
            <div
              style={{
                position: "absolute",
                borderRadius: 5,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(180, 0, 255, 0.05)",
                color: "rgb(172 177 180)",
                zIndex: 100,
              }}>
              &nbsp;
            </div>
          </div>
        </div>
      )
    }
    return this.getQueryStrategy()
  }
}
