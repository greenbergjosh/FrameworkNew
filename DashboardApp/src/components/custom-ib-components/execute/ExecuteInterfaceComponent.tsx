import React, { CSSProperties } from "react"
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

  componentDidUpdate(
    prevProps: Readonly<ExecuteInterfaceComponentProps>,
    prevState: Readonly<ExecuteInterfaceComponentState>
  ): void {
    if (!this.props.executeImmediately || this.props.mode === "edit" || this.props.mode === "preview") {
      return
    }
    /*
     * Refresh the fetched results if the data source has changed.
     * This may happen when the data source is bound to the model.
     */
    if (
      (!this.props.RemoteQuery_isCRUD && prevProps.remoteQuery !== this.props.remoteQuery) ||
      (!this.props.RemoteUrl_isCRUD && prevProps.remoteUrl !== this.props.remoteUrl) ||
      (!this.props.RemoteConfig_isCRUD && prevProps.RemoteConfig_entityTypeId !== this.props.RemoteConfig_entityTypeId)
    ) {
      this.setState({ submitting: true })
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

  /**
   * Map the query params using paramKVPMaps
   */
  private getParamsFromParamKVPMaps = (): JSONRecord => {
    const { paramKVPMaps, userInterfaceData } = this.props

    /*
     * Temporarily merge TransientParams with userInterfaceData
     * so we can map the paramKVPMaps all at once and extract either data.
     */
    const uiDataWithTransientParams = Object.keys(this.state.transientParams).reduce(
      (acc, key) => {
        const val = this.state.transientParams[key] //this.getValue(key)
        const { mergedData } = this.getMergedData(key, val, acc)
        return mergedData
      },
      { ...userInterfaceData } as JSONRecord
    )

    /* Nothing to map so just merge the TransientParams and return */
    if (!paramKVPMaps || !paramKVPMaps.values || !paramKVPMaps.values.reduce) {
      return uiDataWithTransientParams
    }

    /* Map the query params */
    const params = paramKVPMaps.values.reduce((acc, item) => {
      const val = this.getValue(item.valueKey, uiDataWithTransientParams)
      if (val) acc[item.fieldName] = val
      return acc
    }, {} as JSONRecord)

    return params
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
      getRootUserInterfaceData,
      setRootUserInterfaceData,
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
            redirectPath={castProps.RemoteConfig_redirectPath}
            entityTypeId={castProps.RemoteConfig_entityTypeId}
            getParams={this.getParamsFromParamKVPMaps}
            getRootUserInterfaceData={getRootUserInterfaceData}
            setRootUserInterfaceData={setRootUserInterfaceData}
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
            useRedirect={castProps.RemoteConfig_useRedirect}
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
            getRootUserInterfaceData={getRootUserInterfaceData}
            setRootUserInterfaceData={setRootUserInterfaceData}
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
            getRootUserInterfaceData={getRootUserInterfaceData}
            setRootUserInterfaceData={setRootUserInterfaceData}
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
    const fieldsetStyle: CSSProperties = !this.props.invisible
      ? {
          padding: "5px 10px 10px 10px",
          backgroundColor: "rgba(180, 0, 255, 0.05)",
          color: "rgb(172 177 180)",
          fontSize: 10,
          display: "inline-block",
          width: "100%",
          overflow: "scroll",
        }
      : {
          fontSize: 10,
        }
    const legendStyle: CSSProperties = !this.props.invisible
      ? { all: "unset", color: "#ca78ef", padding: 5, fontSize: 14 }
      : {
          all: "unset",
          color: "rgb(172 177 180)",
          fontWeight: "bold",
        }

    if (this.props.mode === "edit") {
      return (
        <fieldset style={fieldsetStyle}>
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
              padding: 5,
              marginTop: 10,
              borderRadius: 3,
              pointerEvents: "none",
              backgroundColor: "white",
              overflow: "hidden",
            }}>
            {this.getQueryStrategy()}
          </div>
        </fieldset>
      )
    }
    return this.getQueryStrategy()
  }
}
