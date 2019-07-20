import { Alert, Spin } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { reporter } from "io-ts-reporters"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import jsonLogic from "json-logic-js"
import JSON5 from "json5"
import React from "react"
import { Right } from "../../data/Either"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { JSONRecord } from "../../data/JSON"
import { QueryConfig, QueryConfigCodec } from "../../data/Report"
import { determineSatisfiedParameters } from "../../lib/determine-satisfied-parameters"
import { cheapHash } from "../../lib/json"
import { shallowPropCheck } from "../interface-builder/dnd"
import { UserInterfaceContext } from "../interface-builder/UserInterfaceContextManager"
import { QueryForm } from "../report/QueryForm"

export interface QueryChildProps<T = any> {
  [key: string]: T[]
}

interface IQueryProps<T> {
  children: (childProps: QueryChildProps<T>) => JSX.Element | JSX.Element[] | null
  dataKey?: string
  inputData?: JSONObject
  queryType: "remote-query" | "remote-config"
}

interface QueryRemoteQueryProps<T> extends IQueryProps<T> {
  queryType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
  // remoteQueryMapping?: [{ label: "label"; value: string }, { label: "value"; value: string }]
}
interface QueryRemoteConfigProps<T> extends IQueryProps<T> {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

export type QueryProps<T = any> = QueryRemoteQueryProps<T> | QueryRemoteConfigProps<T>

interface QueryState<T> {
  data: T[]
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  parameterValues: { [key: string]: any }
  promptLayout: QueryConfig["layout"]
  promptParameters: QueryConfig["parameters"]
  renderedChildren?: ReturnType<IQueryProps<T>["children"]>
}

export class Query<T = any> extends React.Component<QueryProps<T>, QueryState<T>> {
  static defaultProps = {
    dataKey: "data",
  }

  static contextType = UserInterfaceContext
  context!: React.ContextType<typeof UserInterfaceContext>

  constructor(props: QueryProps<T>) {
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

  componentDidUpdate(prevProps: QueryProps<T>, prevState: QueryState<T>) {
    console.log("Query.componentDidUpdate", {
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
    } else {
      // Memoize rendered children
      if (
        (this.state.loadStatus === "loaded" && prevState.loadStatus !== "loaded") ||
        !shallowPropCheck(["children", "dataKey", "data"])(prevProps, this.props)
      ) {
        const { children, dataKey } = this.props as (QueryProps<T> & typeof Query["defaultProps"])
        const { data } = this.state
        this.setState((state) => ({
          ...state,
          renderedChildren: children && children({ [dataKey]: data }),
        }))
      }
    }
  }

  loadRemoteData() {
    const { remoteDataFilter, inputData } = this.props
    const { parameterValues } = this.state

    console.log("Query.loadRemoteData", "Loading Remote Data", {
      props: this.props,
      state: this.state,
      context: this.context,
    })
    if (this.context) {
      const { executeQuery, loadById, loadByFilter, reportDataByQuery } = this.context

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

          this.setState({
            data: (loadByFilter(predicate) as unknown) as T[],
            loadStatus: "loaded",
            loadError: null,
          })
        }
      } else if (this.props.queryType === "remote-query") {
        if (this.props.remoteQuery) {
          const { remoteQuery } = this.props
          if (/* !hidden && */ remoteQuery) {
            const queryGlobalConfig = loadById(remoteQuery)
            if (queryGlobalConfig) {
              const queryConfig = QueryConfigCodec.decode(
                JSON5.parse(queryGlobalConfig.config.getOrElse(""))
              )
              queryConfig.fold(
                (errors) => {
                  console.error("Query.loadRemoteData", "Invalid Query", reporter(queryConfig))
                  this.setState((state) => ({
                    ...state,
                    loadStatus: "error",
                    loadError: "Query was invalid. Check developer tools for details.",
                  }))
                },
                Right((queryConfig) => {
                  console.log("Query.loadRemoteData", "Checking for loaded values", queryConfig)

                  // These are the parameters the form will prompt for
                  // -----
                  const {
                    unsatisfiedByParentParams: promptParameters,
                  } = determineSatisfiedParameters(queryConfig.parameters, inputData || {}, true)

                  this.setState((state) => ({
                    ...state,
                    promptParameters /* : promptParameters.filter(
                      (parameter) =>
                        parameter.defaultValue.isNone() ||
                        typeof parameter.defaultValue.toUndefined() === "undefined"
                    ) */,
                    promptLayout: queryConfig.layout,
                  }))
                  //------

                  // These are the parameters we're using to determine the actual decision to load the data
                  const {
                    satisfiedByParentParams: satisfiedParams,
                    unsatisfiedByParentParams,
                  } = determineSatisfiedParameters(
                    queryConfig.parameters,
                    {
                      ...inputData,
                      ...parameterValues,
                    },
                    true
                  )

                  if (!unsatisfiedByParentParams.length) {
                    const queryResultURI = cheapHash(queryConfig.query, satisfiedParams)
                    const queryResult = record.lookup<JSONRecord[]>(
                      queryResultURI,
                      reportDataByQuery
                    )

                    queryResult.foldL(
                      () => {
                        console.log("Query.loadRemoteData", "Loading")
                        this.setState((state) => ({ ...state, loadStatus: "loading" }))
                        executeQuery({
                          resultURI: queryResultURI,
                          query: queryConfig.query,
                          params: satisfiedParams,
                        }).then(() => {
                          console.log("Query.loadRemoteData", "Clear loading state")
                          this.setState((state) => ({ ...state, loadStatus: "none" }))
                        })
                      },
                      (resultValues) => {
                        console.log("Query.loadRemoteData", "Loaded, no remote")
                        this.setState((state) => ({
                          ...state,
                          data: (resultValues as unknown) as T[],
                          loadStatus: "loaded",
                        }))
                      }
                    )
                  } else {
                    console.log(
                      "Query.loadRemoteData",
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
    } else {
      console.warn(
        "Query.loadRemoteData",
        "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
    }
  }

  render(): JSX.Element {
    const { children, dataKey, queryType } = this.props as (QueryProps<T> &
      typeof Query["defaultProps"])
    const {
      data,
      loadError,
      loadStatus,
      parameterValues,
      promptLayout,
      promptParameters,
      renderedChildren,
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
              console.log("Submitted Form Data", formProps)
            }}
          />
        )}
        {renderedChildren}

        {/* <Alert type="warning" message={<pre>{JSON.stringify({ [dataKey]: data }, null, 2)}</pre>} /> */}
      </Spin>
    )
  }
}
