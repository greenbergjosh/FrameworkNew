import React from "react"
import { Alert, Empty, Icon } from "antd"
import {
  BaseInterfaceComponent,
  getMergedData,
  UserInterfaceContext,
  UserInterfaceContextManager,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { settings } from "./settings"
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
import { PersistedConfig } from "../../api/GlobalConfigCodecs"
import { JSONRecord } from "../../lib/JSONRecord"
import { AdminUserInterfaceContext } from "../../contexts/AdminUserInterfaceContextManager"
import layoutDefinition from "./layoutDefinition"

export default class ExecuteInterfaceComponent extends BaseInterfaceComponent<
  ExecuteInterfaceComponentProps,
  ExecuteInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }
  static getLayoutDefinition() {
    return layoutDefinition
  }
  static manageForm = settings
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
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
   *
   */
  static getSummary(props: Partial<ExecuteInterfaceComponentProps>): JSX.Element | undefined {
    return (
      <>
        <div>
          <strong>Type:</strong> {props.queryType}
        </div>
        <div>
          <strong>Outbound Value Key:</strong> {props.outboundValueKey}
        </div>
        {props.executeImmediately && (
          <div>
            <Icon type="check-square" /> <strong>Execute Immediately</strong>
          </div>
        )}
        {props.RemoteConfig_useDefault && (
          <div>
            <Icon type="check-square" /> <strong>Config Default</strong>
          </div>
        )}
      </>
    )
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
    if (this.props.outboundLoadingKey) {
      const isLoading = eventName === "loading"
      this.setValue([this.props.outboundLoadingKey, isLoading])
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
    const uiDataWithTransientParams = Object.keys(this.state.transientParams).reduce<UserInterfaceProps["data"]>(
      (acc, key) => {
        const val = this.state.transientParams[key]
        const { isLocalDataDirty, isRootDataDirty, localData, rootData } = getMergedData(
          [key, val],
          userInterfaceData,
          this.props.getRootUserInterfaceData
        )
        if (isLocalDataDirty) {
          acc = { ...acc, ...localData }
        }
        if (isRootDataDirty) {
          acc = { ...acc, $root: { ...acc.$root, ...rootData } }
        }
        return acc
      },
      { ...userInterfaceData, $root: this.props.getRootUserInterfaceData() }
    )

    /* Nothing to map so just merge the TransientParams and return */
    if (!paramKVPMaps || !paramKVPMaps.values || !paramKVPMaps.values.reduce) {
      return uiDataWithTransientParams
    }

    /* Map the query params */
    const params = paramKVPMaps.values.reduce<JSONRecord>((acc, item) => {
      const val = this.getValue(item.valueKey, uiDataWithTransientParams)
      if (val) acc[item.fieldName] = val
      return acc
    }, {})

    return params
  }

  private handleResults = (data: UserInterfaceProps["data"]) => {
    this.setValue([this.props.outboundValueKey, data])
  }

  /* ******************************************
   *
   * RENDER METHOD
   */

  getQueryStrategy(): JSX.Element {
    if (!this.context) {
      return <Alert type="warning" message="Remote Component is missing a context" />
    }

    const {
      getRootUserInterfaceData,
      onChangeRootData,
      mode,
      onChangeData,
      outboundValueKey,
      remoteQuery,
      remoteUrl,
      userInterfaceData,
      queryType,
    } = this.props
    const { executeQuery, executeQueryUpdate, loadById, reportDataByQuery, executeHTTPRequestQuery } = this.context
    let castProps

    switch (queryType) {
      case "remote-config":
        castProps = this.props as ExecuteRemoteConfigInterfaceComponentProps
        return (
          <RemoteConfig
            actionType={castProps.RemoteConfig_actionType}
            configDefault={castProps.RemoteConfig_configDefault}
            entityTypeId={castProps.RemoteConfig_entityTypeId}
            getDefinitionDefaultValue={ExecuteInterfaceComponent.getDefinitionDefaultValue}
            getParams={this.getParamsFromParamKVPMaps}
            getRootUserInterfaceData={getRootUserInterfaceData}
            getValue={this.getValue.bind(this)}
            mode={mode}
            onChangeData={onChangeData}
            onChangeRootData={onChangeRootData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            onResults={this.handleResults}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submitting}
            redirectPath={castProps.RemoteConfig_redirectPath}
            remoteConfigStaticId={castProps.RemoteConfig_staticId}
            resultsType={castProps.RemoteConfig_resultsType}
            setParentSubmitting={this.setSubmitting}
            useConfigDefault={castProps.RemoteConfig_useConfigDefault}
            useRedirect={castProps.RemoteConfig_useRedirect}
            userInterfaceData={userInterfaceData}
          />
        )
      case "remote-query":
        castProps = this.props as ExecuteRemoteQueryInterfaceComponentProps

        return (
          <RemoteQuery
            executeQuery={executeQuery}
            executeQueryUpdate={executeQueryUpdate}
            getDefinitionDefaultValue={ExecuteInterfaceComponent.getDefinitionDefaultValue}
            getParams={this.getParamsFromParamKVPMaps}
            getRootUserInterfaceData={getRootUserInterfaceData}
            isCRUD={castProps.RemoteQuery_isCRUD}
            loadById={loadById}
            mode={mode}
            notifyOkShow={castProps.RemoteQuery_notifyOkShow}
            notifyServerExceptionShow={castProps.RemoteQuery_notifyServerExceptionShow}
            notifyUnauthorizedShow={castProps.RemoteQuery_notifyUnauthorizedShow}
            onChangeData={onChangeData}
            onChangeRootData={onChangeRootData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            onResults={this.handleResults}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submitting}
            queryConfigId={remoteQuery as PersistedConfig["id"]}
            reportDataByQuery={reportDataByQuery}
            setParentSubmitting={this.setSubmitting}
            userInterfaceData={userInterfaceData}
          />
        )
      case "remote-url":
        castProps = this.props as ExecuteRemoteUrlInterfaceComponentProps
        return (
          <RemoteUrl
            executeHTTPRequestQuery={executeHTTPRequestQuery}
            getDefinitionDefaultValue={ExecuteInterfaceComponent.getDefinitionDefaultValue}
            getParams={this.getParamsFromParamKVPMaps}
            getRootUserInterfaceData={getRootUserInterfaceData}
            isCRUD={castProps.RemoteUrl_isCRUD}
            loadById={loadById}
            mode={mode}
            notifyOkShow={castProps.RemoteUrl_notifyOkShow}
            notifyServerExceptionShow={castProps.RemoteUrl_notifyServerExceptionShow}
            notifyUnauthorizedShow={castProps.RemoteUrl_notifyUnauthorizedShow}
            onChangeData={onChangeData}
            onChangeRootData={onChangeRootData}
            onMount={this.handleQueryFormMount}
            onRaiseEvent={this.handleRaiseEvent}
            onResults={this.handleResults}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submitting}
            queryConfigId={remoteUrl as PersistedConfig["id"]}
            reportDataByQuery={reportDataByQuery}
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
    if (this.props.mode === "edit") {
      return (
        <div
          style={{
            padding: 5,
            borderRadius: 3,
            pointerEvents: "none",
            backgroundColor: "white",
            overflow: "hidden",
          }}>
          {this.getQueryStrategy()}
        </div>
      )
    }
    return this.getQueryStrategy()
  }
}
