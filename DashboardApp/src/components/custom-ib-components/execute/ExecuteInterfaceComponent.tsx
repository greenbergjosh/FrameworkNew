import React from "react"
import { get, set } from "lodash/fp"
import { BaseInterfaceComponent, UserInterfaceContext } from "@opg/interface-builder"
import { AdminUserInterfaceContextManager } from "../../../data/AdminUserInterfaceContextManager.type"
import { JSONRecord } from "../../../data/JSON"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { QueryForm } from "../../query/QueryForm"
import { executeManageForm } from "./execute-manage-form"
import { ExecuteInterfaceComponentProps, ExecuteInterfaceComponentState } from "./types"
import { getConfig, getResultData } from "./queryConfig/utils"
import { executeRemoteQuery } from "./queryConfig/remoteQuery"
import { executeRemoteUrl } from "./queryConfig/remoteUrl"
import { QueryParams } from "../../query/QueryParams"
import * as record from "fp-ts/lib/Record"
import { Option, some } from "fp-ts/lib/Option"
import { HTTPRequestQueryConfig, QueryConfig } from "../../../data/Report"

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
    }
  }

  /* ***************************************************************************
   *
   * EVENT HANDLERS
   */

  /**
   * Put the query config from Persisted Global Configs into state
   * Originally from Query.tsx
   */
  componentDidMount(): void {
    const { queryType, remoteQuery, remoteUrl, remoteConfigType } = this.props

    if (!this.context) {
      console.warn(
        "ExecuteInterfaceComponent",
        "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
      return
    }
    if (!queryType) return

    let persistedConfigId: PersistedConfig["id"]
    switch (queryType) {
      case "remote-query":
        persistedConfigId = remoteQuery as PersistedConfig["id"]
        break
      case "remote-url":
        persistedConfigId = remoteUrl as PersistedConfig["id"]
        break
      case "remote-config":
        persistedConfigId = remoteConfigType as PersistedConfig["id"]
        break
    }

    const { loadById } = this.context as AdminUserInterfaceContextManager
    const persistedConfig = loadById(persistedConfigId) as PersistedConfig

    if (!persistedConfig) {
      console.warn("persistedConfig not found!")
      return
    }
    const newState = getConfig(persistedConfig)
    this.setState((state) => ({
      ...state,
      ...newState,
    }))
  }

  componentWillUnmount(): void {
      if (this.autoExecuteTimer) {
          clearInterval(this.autoExecuteTimer)
          this.autoExecuteTimer = null
      }
  }

  handleMount = (
    parameterValues: JSONRecord,
    satisfiedByParentParams: JSONRecord,
    setParameterValues: (value: React.SetStateAction<Option<JSONRecord>>) => void
  ) => {
    if (this.props.executeImmediately) {
      this.handleSubmit(parameterValues, satisfiedByParentParams, setParameterValues)
      if (this.props.autoExecuteIntervalSeconds) {
        this.autoExecuteTimer = setInterval(() => this.handleSubmit(parameterValues, satisfiedByParentParams, setParameterValues), this.props.autoExecuteIntervalSeconds * 1000)
	  }
    }
  }

  /* Originally from ReportBody.tsx */
  handleSubmit = (
    parameterValues: JSONRecord,
    satisfiedByParentParams: JSONRecord,
    setParameterValues: (value: React.SetStateAction<Option<JSONRecord>>) => void
  ) => {
    console.log("ExecuteInterfaceComponent.handleSubmit", this.props, this.state, "formValues", parameterValues)
    const { queryConfig } = this.state
    if (!queryConfig) return

    setParameterValues(some(parameterValues))

    switch (this.props.queryType) {
      case "remote-config":
        console.warn("Remote Config query type is not yet supported.")
        break
      case "remote-query":
        return executeRemoteQuery(
          queryConfig as QueryConfig,
          { ...satisfiedByParentParams, ...parameterValues },
          parameterValues,
          this.context as AdminUserInterfaceContextManager,
          !!this.props.isCRUD
        ).then((newLoadingState) => {
          // Set the resulting loading state
          this.setState((state) => ({
            ...state,
            ...newLoadingState,
          }))

          // Load the response data from cache into userInterfaceData
          const { reportDataByQuery } = this.context as AdminUserInterfaceContextManager
          const resultData = getResultData(queryConfig.query, satisfiedByParentParams, reportDataByQuery)

          this.handleChangeData({ ...parameterValues, ...resultData })
        })
      case "remote-url":
        return executeRemoteUrl(
          queryConfig as HTTPRequestQueryConfig,
          { ...satisfiedByParentParams, ...parameterValues },
          parameterValues,
          this.context as AdminUserInterfaceContextManager,
          !!this.props.isCRUD
        ).then((newLoadingState) => {
          // Set the resulting loading state
          this.setState((state) => ({
            ...state,
            ...newLoadingState,
          }))

          // Load the response data from cache into userInterfaceData
          const { reportDataByQuery } = this.context as AdminUserInterfaceContextManager
          const resultData = getResultData(queryConfig.query, satisfiedByParentParams, reportDataByQuery)

          this.handleChangeData({ ...parameterValues, ...resultData })
        })
      default:
    }
  }

  handleChangeData = (newData: any): void => {
    const { onChangeData, userInterfaceData, outboundValueKey } = this.props

    if (onChangeData) {
      // If there's a outboundValueKey, nest the data
      if (outboundValueKey) {
        onChangeData(set(outboundValueKey, newData[0], userInterfaceData))
      } else {
        // If there's not a outboundValueKey, merge the data at the top level
        onChangeData({ ...userInterfaceData, ...newData })
      }
    }
  }

  /* ***************************************************************************
   *
   * RENDER METHOD
   */

  render(): JSX.Element {
    const { buttonLabel, buttonProps, userInterfaceData, valueKey } = this.props
    const { queryConfig } = this.state
    const data = get(valueKey, userInterfaceData)

    if (!queryConfig) return <></>

    return (
      <QueryParams queryConfig={queryConfig} parentData={data}>
        {({ parameterValues, satisfiedByParentParams, setParameterValues, unsatisfiedByParentParams }) => (
          <QueryForm
            layout={queryConfig.layout}
            onSubmit={(queryFormValues) =>
              this.handleSubmit(queryFormValues, satisfiedByParentParams, setParameterValues)
            }
            onMount={(queryFormValues) =>
              this.handleMount(queryFormValues, satisfiedByParentParams, setParameterValues)
            }
            parameters={unsatisfiedByParentParams}
            parameterValues={parameterValues.getOrElse(record.empty)}
            submitButtonLabel={buttonLabel || "Save"}
            submitButtonProps={buttonProps}
          />
        )}
      </QueryParams>
    )
  }
}
