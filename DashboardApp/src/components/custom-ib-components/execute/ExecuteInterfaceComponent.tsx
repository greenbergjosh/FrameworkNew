import React from "react"
import { BaseInterfaceComponent, UserInterfaceContext } from "@opg/interface-builder"
import { executeManageForm } from "./execute-manage-form"
import {
  ActionType,
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
import { Empty } from "antd"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"

export class ExecuteInterfaceComponent extends BaseInterfaceComponent<
  ExecuteInterfaceComponentProps,
  ExecuteInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    inboundValueKey: "data",
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
  context!: React.ContextType<typeof UserInterfaceContext>
  autoExecuteTimer?: ReturnType<typeof setInterval> | null

  constructor(props: ExecuteInterfaceComponentProps) {
    super(props)

    this.state = {
      data: [],
      formState: {},
      loadError: null,
      loadStatus: "none",
      submittingQueryForm: false,
    }
  }

  /**
   * Public method for external clients to trigger a submit
   * @public
   */
  public submit(): void {
    console.log("ExecuteInterfaceComponent", "submit")
    this.setState({ submittingQueryForm: true })
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

  /* ******************************************
   *
   * RENDER METHOD
   */

  render(): JSX.Element {
    const {
      buttonLabel,
      buttonProps,
      onChangeData,
      outboundValueKey,
      remoteConfigType,
      remoteQuery,
      remoteUrl,
      userInterfaceData,
      valueKey,
      queryType,
    } = this.props
    let castProps

    switch (queryType) {
      case "remote-config":
        castProps = this.props as ExecuteRemoteConfigInterfaceComponentProps
        return (
          <RemoteConfig
            buttonLabel={buttonLabel}
            buttonProps={buttonProps}
            context={this.context}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submittingQueryForm}
            persistedConfigId={remoteConfigType as PersistedConfig["id"]}
            setParentSubmitting={this.setParentSubmitting}
            userInterfaceData={userInterfaceData}
            valueKey={valueKey}
            actionType={castProps.RemoteConfig_actionType}
            configNameKey={castProps.RemoteConfig_configNameKey}
            entityTypeId={castProps.RemoteConfig_entityTypeId}
            remoteConfigId={castProps.RemoteConfig_id}
            remoteConfigIdKey={castProps.RemoteConfig_idKey}
            resultsType={castProps.RemoteConfig_resultsType}
          />
        )
      case "remote-query":
        castProps = this.props as ExecuteRemoteQueryInterfaceComponentProps
        return (
          <RemoteQuery
            buttonLabel={buttonLabel}
            buttonProps={buttonProps}
            context={this.context}
            isCRUD={castProps.RemoteQuery_isCRUD}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submittingQueryForm}
            persistedConfigId={remoteQuery as PersistedConfig["id"]}
            setParentSubmitting={this.setParentSubmitting}
            userInterfaceData={userInterfaceData}
            valueKey={valueKey}
          />
        )
      case "remote-url":
        castProps = this.props as ExecuteRemoteUrlInterfaceComponentProps
        return (
          <RemoteUrl
            buttonLabel={buttonLabel}
            buttonProps={buttonProps}
            context={this.context}
            isCRUD={castProps.RemoteUrl_isCRUD}
            onChangeData={onChangeData}
            onMount={this.handleQueryFormMount}
            outboundValueKey={outboundValueKey}
            parentSubmitting={this.state.submittingQueryForm}
            persistedConfigId={remoteUrl as PersistedConfig["id"]}
            setParentSubmitting={this.setParentSubmitting}
            userInterfaceData={userInterfaceData}
            valueKey={valueKey}
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
}
