/* eslint-disable @typescript-eslint/camelcase */
import React from "react"
import { set } from "lodash/fp"
import {
  BaseInterfaceComponent,
  UserInterfaceContext,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { AdminUserInterfaceContextManager } from "../../../data/AdminUserInterfaceContextManager.type"
import { determineSatisfiedParameters } from "../../../lib/determine-satisfied-parameters"
import { JSONRecord } from "../../../data/JSON"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { QueryForm } from "../../report/QueryForm"
import { executeManageForm } from "./execute-manage-form"
import { ExecuteInterfaceComponentProps, ExecuteInterfaceComponentState } from "./types"
import { getQueryConfig, hasContext } from "./queryConfig"
import { remoteQuery_executeQuery } from "./remoteQuery"
import { remoteUrl_executeQuery } from "./remoteUrl"

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
  context!: React.ContextType<typeof UserInterfaceContext>
  constructor(props: ExecuteInterfaceComponentProps) {
    super(props)

    this.state = {
      data: [],
      formState: {},
      loadError: null,
      loadStatus: "none",
      parameterValues: {},
      promptLayout: [],
      promptParameters: [],
      queryConfig: null,
    }
  }

  /****************************************************************************
   * EVENT HANDLERS
   */

  /* From Query.tsx */
  componentDidMount() {
    if (!hasContext(this.context)) return
    if (this.props.queryType && this.props.remoteQuery) {
      const { loadById } = this.context
      const { remoteQuery, userInterfaceData } = this.props
      this.loadFromGlobalConfigStore(
        loadById,
        remoteQuery as PersistedConfig["id"],
        userInterfaceData
      )
    }
  }

  /* Originally from ReportBody.tsx */
  handleSubmit = (queryFormValues: JSONRecord /*dispatch: AppDispatch*/) => {
    console.log(
      "ExecuteInterfaceComponent.handleSubmit",
      this.props,
      this.state,
      "formValues",
      queryFormValues
    )
    const { queryConfig, parameterValues } = this.state
    if (!queryConfig) {
      return
    }

    switch (this.props.queryType) {
      case "remote-config":
        break
      case "remote-query":
        return remoteQuery_executeQuery(
          queryConfig,
          parameterValues,
          queryFormValues,
          this.context
        ).then((newState) => {
          this.setState((state) => ({
            ...state,
            ...newState,
          }))
          this.handleChangeData(queryFormValues)
        })
      case "remote-url":
        return remoteUrl_executeQuery(
          queryConfig,
          parameterValues,
          queryFormValues,
          this.context,
        ).then((newState) => {
          this.setState((state) => ({
            ...state,
            ...newState,
          }))
          this.handleChangeData(queryFormValues)
        })
        break
      default:
    }
  }

  handleChangeData = (newData: any) => {
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

  /****************************************************************************
   * RENDER METHOD
   */

  render(): JSX.Element {
    const { buttonLabel } = this.props
    const {
      data,
      loadError,
      loadStatus,
      parameterValues,
      promptLayout,
      promptParameters,
    } = this.state

    return (
      <QueryForm
        layout={promptLayout}
        parameters={promptParameters}
        parameterValues={parameterValues}
        onSubmit={(queryFormValues) => this.handleSubmit(queryFormValues /*dispatch*/)}
        submitButtonLabel={buttonLabel || "Save"}
      />
    )
  }

  /****************************************************************************
   * PRIVATE MEMBERS
   */

  /* From Query.tsx */
  private loadFromGlobalConfigStore(
    loadById: AdminUserInterfaceContextManager["loadById"],
    remoteQuery: PersistedConfig["id"],
    userInterfaceData: UserInterfaceProps["data"]
  ) {
    const queryGlobalConfig = loadById(remoteQuery) as PersistedConfig
    if (!queryGlobalConfig) {
      console.warn("queryGlobalConfig not found!")
    }
    const newState = getQueryConfig(queryGlobalConfig)
    const { queryConfig } = newState
    this.setState((state) => ({
      ...state,
      ...newState,
    }))
    if (queryConfig) {
      const { satisfiedByParentParams } = queryConfig.parameters
        ? determineSatisfiedParameters(queryConfig.parameters, userInterfaceData || {}, true)
        : { satisfiedByParentParams: {} }
      this.setState((state) => ({
        ...state,
        promptLayout: queryConfig.layout,
        promptParameters: queryConfig.parameters,
        parameterValues: satisfiedByParentParams,
      }))
    }
  }
}
