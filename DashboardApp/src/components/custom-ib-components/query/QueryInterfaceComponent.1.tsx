import { Alert, Spin } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { reporter } from "io-ts-reporters"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import jsonLogic from "json-logic-js"
import JSON5 from "json5"
import React from "react"
import { AdminUserInterfaceContextManager } from "../../../data/AdminUserInterfaceContextManager.type"
import { Right } from "../../../data/Either"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { QueryConfig, QueryConfigCodec } from "../../../data/Report"
import { determineSatisfiedParameters } from "../../../lib/determine-satisfied-parameters"
import { cheapHash } from "../../../lib/json"
import { QueryForm } from "../../report/QueryForm"
import { queryManageForm } from "./query-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  UserInterfaceContext,
  UserInterfaceProps,
} from "@opg/interface-builder"

export interface IQueryInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "query"
  onChangeData: UserInterfaceProps["onChangeData"]
  queryType: "remote-query" | "remote-config"
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

interface QueryRemoteQueryInterfaceComponentProps extends IQueryInterfaceComponentProps {
  queryType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
  // remoteQueryMapping?: [{ label: "label"; value: string }, { label: "value"; value: string }]
}
interface QueryRemoteConfigInterfaceComponentProps extends IQueryInterfaceComponentProps {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

type QueryInterfaceComponentProps =
  | QueryRemoteQueryInterfaceComponentProps
  | QueryRemoteConfigInterfaceComponentProps

interface QueryInterfaceComponentState {
  data: any[]
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  parameterValues: { [key: string]: any }
  promptLayout: QueryConfig["layout"]
  promptParameters: QueryConfig["parameters"]
}

export class QueryInterfaceComponent extends BaseInterfaceComponent<
  QueryInterfaceComponentProps,
  QueryInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "query",
      title: "Query",
      icon: "database",
      componentDefinition: {
        component: "query",
        label: "Query",
      },
    }
  }

  static manageForm = queryManageForm
  static contextType = UserInterfaceContext
  context!: React.ContextType<typeof UserInterfaceContext>

  constructor(props: QueryInterfaceComponentProps) {
    super(props)

    this.state = {
      data: [],
      loadError: null,
      loadStatus: "none",
      parameterValues: {},
      promptLayout: [],
      promptParameters: [],
    }
  }

  componentDidMount() {
    // If the data type is set, load the data
    if (this.props.queryType) {
      this.loadRemoteData()
    }
  }

  componentDidUpdate(
    prevProps: QueryInterfaceComponentProps,
    prevState: QueryInterfaceComponentState
  ) {
    console.log("QueryInterfaceComponent.componentDidUpdate", {
      was: prevState.loadStatus,
      is: this.state.loadStatus,
    })
    // If the data handler type has changed, and the new type is remote
    // or if the remote config type has changed
    // or if the remote query has changed
    if (
      (this.props.queryType !== prevProps.queryType ||
        (this.props.queryType === "remote-config" &&
          prevProps.queryType === "remote-config" &&
          this.props.remoteConfigType !== prevProps.remoteConfigType) ||
        (this.props.queryType === "remote-query" &&
          prevProps.queryType === "remote-query" &&
          this.props.remoteQuery !== prevProps.remoteQuery)) &&
      this.props.queryType
    ) {
      this.setState(
        (state) => ({
          data: [],
          loadError: null,
          loadStatus: "none",
          parameterValues: {},
          promptLayout: [],
          promptParameters: [],
        }),
        () => this.loadRemoteData()
      )
    } else if (
      this.props.queryType &&
      this.state.loadStatus === "none" &&
      prevState.loadStatus === "loading"
    ) {
      this.loadRemoteData()
    }
  }

  loadRemoteData() {
    const { hidden, remoteDataFilter, userInterfaceData } = this.props
    const { parameterValues } = this.state
    if (this.context) {
      const { executeQuery, loadById, loadByFilter, reportDataByQuery } = this
        .context as AdminUserInterfaceContextManager

      if (this.props.queryType === "remote-config") {
        if (this.props.remoteConfigType) {
          const { remoteConfigType } = this.props

          const remoteConfigTypeParent = remoteConfigType && loadById(remoteConfigType)
          const remoteConfigTypeParentName = remoteConfigTypeParent && remoteConfigTypeParent.name

          const predicate = remoteDataFilter
            ? (config: PersistedConfig) => {
                const parsedConfig = {
                  ...config,
                  config: config.config
                    .chain((cfg) => tryCatch(() => JSON5.parse(cfg)))
                    .toNullable(),
                }

                const dataFilterResult = jsonLogic.apply(remoteDataFilter, parsedConfig)
                return remoteConfigType
                  ? (config.type === remoteConfigType ||
                      config.type === remoteConfigTypeParentName) &&
                      dataFilterResult
                  : dataFilterResult
              }
            : remoteConfigType
            ? (config: PersistedConfig) =>
                config.type === remoteConfigType || config.type === remoteConfigTypeParentName
            : (config: PersistedConfig) => true

          this.setState({ data: loadByFilter(predicate), loadStatus: "loaded", loadError: null })
        }
      } else if (this.props.queryType === "remote-query") {
        if (this.props.remoteQuery) {
          const { remoteQuery } = this.props
          if (!hidden && remoteQuery) {
            const queryGlobalConfig = loadById(remoteQuery)
            if (queryGlobalConfig) {
              const queryConfig = QueryConfigCodec.decode(
                JSON5.parse(queryGlobalConfig.config.getOrElse(""))
              )
              queryConfig.fold(
                (errors) => {
                  console.error(
                    "QueryInterfaceComponent.render",
                    "Invalid Query",
                    reporter(queryConfig)
                  )
                  this.setState((state) => ({
                    ...state,
                    loadStatus: "error",
                    loadError: "Query was invalid. Check developer tools for details.",
                  }))
                },
                Right((queryConfig) => {
                  console.log(
                    "QueryInterfaceComponent.render",
                    "Checking for loaded values",
                    queryConfig
                  )

                  const {
                    unsatisfiedByParentParams: promptParameters,
                  } = determineSatisfiedParameters(queryConfig.parameters, userInterfaceData)

                  this.setState((state) => ({
                    ...state,
                    promptParameters,
                    promptLayout: queryConfig.layout,
                  }))

                  const {
                    satisfiedByParentParams: satisfiedParams,
                    unsatisfiedByParentParams,
                  } = determineSatisfiedParameters(queryConfig.parameters, {
                    ...userInterfaceData,
                    ...parameterValues,
                  })

                  if (!unsatisfiedByParentParams.length) {
                    const queryResultURI = cheapHash(queryConfig.query, satisfiedParams)
                    const queryResult = record.lookup(queryResultURI, reportDataByQuery)

                    queryResult.foldL(
                      () => {
                        // console.log("QueryInterfaceComponent.render", "Loading")
                        this.setState((state) => ({ ...state, loadStatus: "loading" }))
                        executeQuery({
                          resultURI: queryResultURI,
                          query: queryConfig,
                          params: satisfiedParams,
                        })
                          .then(() => {
                            // console.log("QueryInterfaceComponent.render", "Clear loading state")
                            this.setState((state) => ({ ...state, loadStatus: "none" }))
                          })
                          .catch((e: Error) => {
                            // console.log("QueryInterfaceComponent.render", "Set error loading state")
                            this.setState({ loadStatus: "error", loadError: e.message })
                          })
                      },
                      (resultValues) => {
                        // console.log("QueryInterfaceComponent.render", "Loaded, no remote")
                        this.setState((state) => ({
                          ...state,
                          data: resultValues,
                          loadStatus: "loaded",
                        }))
                      }
                    )
                  } else {
                    console.info(
                      "QueryInterfaceComponent.render",
                      "Cannot start loading due to unsatisfied parameters",
                      unsatisfiedByParentParams
                    )
                  }
                })
              )
            }
          }
          return
        }
      }
    }
  }

  render(): JSX.Element {
    const { queryType, valueKey } = this.props
    const {
      data,
      loadError,
      loadStatus,
      parameterValues,
      promptLayout,
      promptParameters,
    } = this.state

    return loadStatus === "error" ? (
      <Alert type="error" message={loadError || "An error occurred during data loading"} />
    ) : (
      <Spin spinning={loadStatus === "loading"}>
        {queryType === "remote-query" && !!promptParameters.length && (
          <QueryForm
            layout={promptLayout}
            parameters={promptParameters}
            parameterValues={parameterValues}
            onSubmit={(formProps) => {
              console.info("Submitted Form Data", formProps)
            }}
          />
        )}
        <Alert
          type="warning"
          message={<pre>{JSON.stringify({ [valueKey]: data }, null, 2)}</pre>}
        />
      </Spin>
    )
  }
}
