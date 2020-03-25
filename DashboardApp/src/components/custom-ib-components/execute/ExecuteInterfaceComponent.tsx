/* eslint-disable @typescript-eslint/camelcase */
import React from "react"
import { executeManageForm } from "./execute-manage-form"
import { BaseInterfaceComponent, UserInterfaceContext } from "@opg/interface-builder"
import { ExecuteInterfaceComponentProps, ExecuteInterfaceComponentState } from "./types"
import { QueryForm } from "../../report/QueryForm"
import { AdminUserInterfaceContextManager } from "../../../data/AdminUserInterfaceContextManager.type"
import { QueryConfig, QueryConfigCodec } from "../../../data/Report"
import JSON5 from "json5"
import { reporter } from "io-ts-reporters"
import { Right } from "../../../data/Either"
import { JSONRecord } from "../../../data/JSON"
import { determineSatisfiedParameters } from "../../../lib/determine-satisfied-parameters"
import { cheapHash } from "../../../lib/json"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"

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
      queryConfig: {},
    }
  }

  /****************************************************************************
   * EVENT HANDLERS
   */

  /* From Query.tsx */
  componentDidMount() {
    if (!hasContext(this.context)) return
    if (this.props.paused) return
    if (this.props.queryType) {
      this.loadFromGlobalConfigStore()
    }
  }

  /* From ReportBody.tsx */
  handleSubmit = (queryFormValues: JSONRecord /*dispatch: AppDispatch*/) => {
    console.log(
      "ExecuteInterfaceComponent.handleSubmit",
      this.props,
      this.state,
      "formValues",
      queryFormValues
    )
    const { queryConfig, parameterValues } = this.state

    return remoteQuery_executeQuery(queryConfig, parameterValues, queryFormValues, this.context).then(
      (newState) => {
        debugger
        this.setState((state) => ({
          ...state,
          ...newState,
        }))
      }
    )
  }

  render(): JSX.Element {
    const {
      data,
      loadError,
      loadStatus,
      parameterValues,
      promptLayout,
      promptParameters,
      submitButtonLabel,
    } = this.state

    return (
      <fieldset style={{ color: "violet", border: "dotted 2px violet", padding: 10 }}>
        <legend>ExecuteInterfaceComponent: remote-query</legend>
        <QueryForm
          layout={promptLayout}
          parameters={promptParameters}
          parameterValues={parameterValues}
          onSubmit={(queryFormValues) => this.handleSubmit(queryFormValues /*dispatch*/)}
          submitButtonLabel={submitButtonLabel || "Save"}
        />
      </fieldset>
    )
  }

  /****************************************************************************
   * PRIVATE MEMBERS
   */

  /* From Query.tsx */
  private loadFromGlobalConfigStore() {
    const { remoteDataFilter, userInterfaceData } = this.props
    const { loadById, loadByFilter } = this.context as AdminUserInterfaceContextManager

    if (this.props.queryType === "remote-config") {
      /*
       * Remote Config
       */
      // TODO: enable remote configs
      // this.loadRemoteConfig(loadById, remoteDataFilter, loadByFilter, this.props.remoteConfigType)
    } else if (this.props.queryType === "remote-query") {
      /*
       * Remote Query
       */
      if (this.props.remoteQuery) {
        const queryGlobalConfig = loadById(this.props.remoteQuery)
        if (queryGlobalConfig) {
          const newState = remoteQuery_getQueryConfig(queryGlobalConfig)
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
              submitButtonLabel: queryConfig.submitButtonLabel,
              parameterValues: satisfiedByParentParams,
            }))
          }
        }
      }
    }
  }
}

/**************************************************************************************
 *
 * PRIVATE FUNCTIONS
 */

/* From Query.tsx */
function remoteQuery_getQueryConfig(queryGlobalConfig: PersistedConfig) {
  const queryConfig = QueryConfigCodec.decode(JSON5.parse(queryGlobalConfig.config.getOrElse("")))
  return queryConfig.fold(
    (errors) => {
      console.error(
        "ExecuteInterfaceComponent.remoteQuery_getQueryConfig",
        "Invalid Query",
        reporter(queryConfig)
      )
      return ({
        loadStatus: "error",
        loadError: "Query was invalid. Check developer tools for details.",
      } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
    },
    Right((queryConfig) => {
      console.log(
        "ExecuteInterfaceComponent.remoteQuery_getQueryConfig",
        "queryConfig",
        queryConfig
      )
      return ({
        queryConfig,
      } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
    })
  )
}

/* From Query.tsx */
async function remoteQuery_executeQuery(
  queryConfig: QueryConfig,
  parameterValues: JSONRecord,
  queryFormValues: JSONRecord,
  context: AdminUserInterfaceContextManager
): Promise<Readonly<Partial<ExecuteInterfaceComponentState>>> {
  const { executeQueryUpdate, reportDataByQuery } = context
  const queryResultURI = cheapHash(queryConfig.query, {
    ...parameterValues,
    ...queryFormValues,
  })

  return Promise.resolve(({
    remoteQueryLoggingName: queryConfig.query,
    loadStatus: "loading",
  } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>).then(() =>
    executeQueryUpdate({
      resultURI: queryResultURI,
      query: queryConfig,
      params: { ...parameterValues, ...queryFormValues },
    })
      .then(() => {
        return ({
          loadStatus: "none",
        } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
      })
      .catch((e: Error) => {
        console.error("Query.remoteQuery_executeQuery", queryConfig.query, e)
        return ({ loadStatus: "error", loadError: e.message } as unknown) as Readonly<
          Partial<ExecuteInterfaceComponentState>
        >
      })
  )
}

function hasContext(context: any): boolean {
  if (!context) {
    console.warn(
      "ExecuteInterfaceComponent.hasContext",
      "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
    )
    return false
  }
  return true
}
