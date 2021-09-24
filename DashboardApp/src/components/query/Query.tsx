import { UserInterfaceContext, UserInterfaceContextManager } from "@opg/interface-builder"
import { Alert, Icon, Spin } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { reporter } from "io-ts-reporters"
import jsonLogic from "json-logic-js"
import JSON5 from "json5"
import React from "react"
import { AdminUserInterfaceContextManager } from "../../data/AdminUserInterfaceContextManager.type"
import { Right } from "../../data/Either"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { JSONRecord } from "../../data/JSON"
import { QueryConfig, QueryConfigCodec } from "../../data/Report"
import { determineSatisfiedParameters } from "./lib/determineSatisfiedParameters"
import { cheapHash } from "../../lib/json"
import { QueryForm } from "./QueryForm"
import { LoadDataParams, QueryProps, QueryState } from "./types"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { Brand, Branded } from "io-ts"
import { NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import { isEqual } from "lodash/fp"

export class Query<T = any> extends React.Component<QueryProps<T>, QueryState<T>> {
  static defaultProps = {
    dataKey: "data",
  }

  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
  context!: React.ContextType<typeof UserInterfaceContext>

  constructor(props: QueryProps<T>) {
    super(props)

    this.state = {
      data: [],
      runCount: 0,
      loadError: null,
      loadStatus: "none",
      parameterValues: {},
      promptLayout: [],
      promptParameters: [],
      refreshTimeout: null,
    }
  }

  /* ***************************************************************************
   *
   * EVENT HANDLERS
   */

  componentDidMount(): void {
    if (this.props.queryType) {
      this.loadRemoteData()
    }

    // Initial rendering of the children
    // Moves props.children into state and
    // passes in data and loading status
    this.renderChildren()
  }

  /**
   * Respond to changes in queryType, remoteConfigType, and remoteQuery
   * by loading data, or restarting timeout, or re-rendering children.
   * @param prevProps
   * @param prevState
   */
  componentDidUpdate(prevProps: QueryProps<T>, prevState: QueryState<T>): void {
    // console.log("Query.componentDidUpdate", {
    //   was: prevState.loadStatus,
    //   is: this.state.loadStatus,
    // })

    // If the data handler type has changed, and the new type is remote
    // or if the remote-config type has changed
    // or if the remote-query has changed
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
    } else if (this.props.queryType && this.state.loadStatus === "none" && prevState.loadStatus === "loading") {
      // Data has finished loading, so start the timeout.
      // NOTE: only remoteQuery uses this timeout (remoteConfig does not refresh)
      setTimeout(() => this.loadRemoteData(), 0)
    } else {
      // Memoize rendered children
      // eslint-disable-next-line no-lonely-if
      if (
        (this.state.loadStatus === "loaded" && prevState.loadStatus !== "loaded") ||
        !(
          isEqual(prevProps.children, this.props.children) &&
          isEqual(prevProps.dataKey, this.props.dataKey) &&
          isEqual(prevProps.inputData, this.props.inputData)
        )
      ) {
        this.renderChildren()
      }
    }
  }

  /**
   * Remove remote data refresh timeout
   */
  componentWillUnmount(): void {
    const { refreshTimeout } = this.state
    if (refreshTimeout) {
      // console.log(
      //   "Query.componentWillUnmount",
      //   this.state.remoteQueryLoggingName,
      //   "Removing refresh timeout"
      // )
      clearTimeout(refreshTimeout)
    }
  }

  render(): JSX.Element {
    const { queryType, getRootUserInterfaceData, onChangeRootData } = this.props as QueryProps<T> &
      typeof Query["defaultProps"]
    const {
      loadError,
      loadStatus,
      parameterValues,
      promptLayout,
      promptParameters,
      renderedChildren,
      submitButtonLabel,
    } = this.state

    return loadStatus === "error" ? (
      <Alert type="error" message={loadError || "An error occurred during data loading"} />
    ) : (
      <Spin spinning={loadStatus === "loading"} indicator={<Icon type="loading" />}>
        {queryType === "remote-query" &&
          !!promptParameters.length &&
          promptParameters.some(({ required }) => required === true) && (
            <QueryForm
              getDefinitionDefaultValue={this.props.getDefinitionDefaultValue}
              getRootUserInterfaceData={getRootUserInterfaceData}
              onChangeRootData={onChangeRootData}
              layout={promptLayout}
              parameters={promptParameters}
              parameterValues={parameterValues}
              onSubmit={(formProps) => {
                console.log("Submitted Form Data", formProps)
              }}
              submitButtonLabel={submitButtonLabel}
            />
          )}
        {renderedChildren}

        {/* <Alert type="warning" message={<pre>{JSON.stringify({ [dataKey]: data }, null, 2)}</pre>} /> */}
      </Spin>
    )
  }

  /* ***************************************************************************
   *
   * PRIVATE MEMBERS
   */

  /**
   * Copy props.children into state and pass down
   * data and loading status to the children's props.
   */
  private renderChildren() {
    const { children /*, dataKey*/ } = this.props as QueryProps<T> & typeof Query["defaultProps"]
    const { data } = this.state
    this.setState((state) => ({
      ...state,
      renderedChildren: children && children({ data, loading: state.loadStatus === "loading" }),
    }))
  }

  private loadRemoteData() {
    if (this.props.paused) return
    const { remoteDataFilter, inputData } = this.props
    const { parameterValues } = this.state

    if (!this.context) {
      console.warn(
        "Query.loadRemoteData",
        "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
      return
    }
    const { loadById, loadByFilter } = this.context as AdminUserInterfaceContextManager

    if (this.props.queryType === "remote-config") {
      this.loadRemoteConfig(loadById, remoteDataFilter, loadByFilter, this.props.remoteConfigType)
    } else if (this.props.queryType === "remote-query") {
      this.validateAndLoadRemoteQuery(loadById, inputData, parameterValues, this.props.remoteQuery)
    }
  }

  /* ***************************************************************************
   * PRIVATE MEMBERS: REMOTE CONFIG
   */

  private loadRemoteConfig(
    loadById: AdminUserInterfaceContextManager["loadById"], // (id: NonEmptyString) => PersistedConfig | null,
    remoteDataFilter: JSONObject | undefined,
    loadByFilter: AdminUserInterfaceContextManager["loadByFilter"], // (predicate: (item: PersistedConfig) => boolean) => PersistedConfig[],
    remoteConfigType: Branded<string, NonEmptyStringBrand> | undefined
  ) {
    if (remoteConfigType) {
      const remoteConfigTypeParent = remoteConfigType && loadById(remoteConfigType)
      const remoteConfigTypeParentName = remoteConfigTypeParent && remoteConfigTypeParent.name
      const predicate = this.getRemoteConfigPredicate(remoteDataFilter, remoteConfigType, remoteConfigTypeParentName)

      this.setState({
        data: loadByFilter(predicate) as unknown as T[],
        loadStatus: "loaded",
        loadError: null,
      })
    }
  }

  private getRemoteConfigPredicate(
    remoteDataFilter: JSONObject | undefined,
    remoteConfigType: PersistedConfig["id"],
    remoteConfigTypeParentName: null | string | Brand<NonEmptyStringBrand>
  ): (config: PersistedConfig) => boolean {
    return remoteDataFilter
      ? (config: PersistedConfig) => {
          const parsedConfig = {
            ...config,
            config: config.config.chain((cfg) => tryCatch(() => JSON5.parse(cfg))).toNullable(),
          }

          const dataFilterResult = jsonLogic.apply(remoteDataFilter, parsedConfig)
          return remoteConfigType
            ? (config.type === remoteConfigType || config.type === remoteConfigTypeParentName) && dataFilterResult
            : dataFilterResult
        }
      : remoteConfigType
      ? (config: PersistedConfig) => config.type === remoteConfigType || config.type === remoteConfigTypeParentName
      : (config: PersistedConfig) => true
  }

  /* ***************************************************************************
   *
   * PRIVATE MEMBERS: REMOTE QUERY
   */

  private validateAndLoadRemoteQuery(
    loadById: AdminUserInterfaceContextManager["loadById"], // (id: NonEmptyString) => PersistedConfig | null,
    inputData: JSONObject | undefined,
    parameterValues: { [p: string]: any },
    remoteQuery: Branded<string, NonEmptyStringBrand> | undefined
  ) {
    if (!remoteQuery) {
      return
    }
    const queryGlobalConfig = loadById(remoteQuery)
    if (!queryGlobalConfig) {
      return
    }
    const queryConfig = QueryConfigCodec.decode(JSON5.parse(queryGlobalConfig.config.getOrElse("")))
    queryConfig.fold(
      (errors) => {
        console.error("Query.loadRemoteQuery", "Invalid Query", reporter(queryConfig))
        this.setState((state) => ({
          ...state,
          loadStatus: "error",
          loadError: "Query was invalid. Check developer tools for details.",
        }))
      },
      Right((queryConfig) => {
        // console.log("Query.validateAndLoadRemoteQuery", queryConfig.query, "Checking for loaded values", queryConfig)
        this.remoteQuery_loadQuery(queryConfig, inputData, parameterValues)
      })
    )
  }

  private remoteQuery_loadQuery(
    queryConfig: QueryConfig,
    inputData: JSONObject | undefined,
    parameterValues: { [p: string]: any }
  ) {
    const { executeQuery, reportDataByQuery } = this.context as AdminUserInterfaceContextManager

    // These are the parameters the form will prompt for
    // -----
    const { unsatisfiedByParentParams: promptParameters } = determineSatisfiedParameters(
      queryConfig.parameters,
      inputData || {},
      true
    )

    this.setState((state) => ({
      ...state,
      promptParameters /* : promptParameters.filter(
                      (parameter) =>
                        parameter.defaultValue.isNone() ||
                        typeof parameter.defaultValue.toUndefined() === "undefined"
                    ) */,
      promptLayout: queryConfig.layout,
      submitButtonLabel: queryConfig.submitButtonLabel,
    }))
    //------

    // These are the parameters we're using to determine the actual decision to load the data
    const { satisfiedByParentParams: satisfiedParams, unsatisfiedByParentParams } = determineSatisfiedParameters(
      queryConfig.parameters,
      { ...inputData, ...parameterValues },
      true
    )

    if (!unsatisfiedByParentParams.length || unsatisfiedByParentParams.every(({ required }) => required !== true)) {
      const queryResultURI = cheapHash(queryConfig.query, satisfiedParams)
      const queryResult = record.lookup<JSONRecord[]>(queryResultURI, reportDataByQuery)

      queryResult.foldL(
        // Cache does not exist, fetch data
        this.remoteQuery_loadWithRefresh({
          dispatchExecuteQuery: executeQuery,
          queryResultURI,
          queryConfig,
          satisfiedParams,
        }),
        // Cache exists, reload from cache
        (resultValues) => {
          // console.log(
          //   "Query.loadRemoteData",
          //   queryConfig.query,
          //   "Loading data into state (no remote)"
          // )
          this.setState((state) => ({
            ...state,
            data: resultValues as unknown as T[],
            loadStatus: "loaded",
          }))
          if (this.props.refresh && this.props.refresh.interval && this.state.refreshTimeout === null) {
            this.remoteQuery_queueNextLoad(this.props.refresh.interval, {
              dispatchExecuteQuery: executeQuery,
              queryResultURI,
              queryConfig,
              satisfiedParams,
            })
          }
        }
      )
    } else {
      console.info(
        "Query.loadRemoteData",
        "Cannot start loading due to unsatisfied parameters",
        unsatisfiedByParentParams
      )
    }
  }

  /**
   * Timeout is set in componentDidUpdate. Only remote-query
   * uses the timeout (remote-config does not refresh).
   * @param loadDataParams
   */
  private remoteQuery_loadWithRefresh(loadDataParams: LoadDataParams) {
    return () => {
      this.remoteQuery_dispatchExecuteQuery(loadDataParams)
        .then(() => {
          if (this.props.refresh && this.props.refresh.interval && this.state.refreshTimeout === null) {
            // console.log(
            //   "Query.loadRemoteWithRefresh",
            //   loadDataParams.queryConfig.query,
            //   "Queueing next"
            // )
            this.remoteQuery_queueNextLoad(this.props.refresh.interval, loadDataParams)
          } else {
            console.debug("Query.loadRemoteWithRefresh", loadDataParams.queryConfig.query, "Next refresh already set")
          }
        })
        .catch((e: Error) => console.error("Query.loadRemoteWithRefresh", loadDataParams.queryConfig.query, e))
    }
  }

  /**
   * Start another data refresh if the previous was successful.
   * @param interval
   * @param loadDataParams
   */
  private remoteQuery_queueNextLoad(interval: number, loadDataParams: LoadDataParams) {
    this.remoteQuery_setLoadInterval(interval, loadDataParams).then(() => {
      // Only que next if previous was successful
      this.remoteQuery_queueNextLoad(interval, loadDataParams)
    })
  }

  /**
   * Create a promise that resolves with fresh data after the timeout
   * @param interval
   * @param loadDataParams
   */
  private remoteQuery_setLoadInterval(interval: number, loadDataParams: LoadDataParams) {
    return new Promise((resolve, reject) => {
      // console.log(
      //   "Query.setRemoteDataLoadInterval",
      //   loadDataParams.queryConfig.query,
      //   `Setting ${interval}s refresh interval`
      // )
      const refreshTimeout = setTimeout(() => {
        // console.log(
        //   "Query.setRemoteDataLoadInterval",
        //   loadDataParams.queryConfig.query,
        //   `Reached ${interval}s refresh interval`
        // )
        this.remoteQuery_dispatchExecuteQuery(loadDataParams)
          .then((response) => {
            resolve(response)
          })
          .catch((e: Error) => {
            reject(e)
          })
      }, interval * 1000)
      this.setState((state) => ({ ...state, refreshTimeout }))
    }) //
  }

  /**
   * Executes the Remote Query
   * @param loadDataParams
   */
  private remoteQuery_dispatchExecuteQuery({
    dispatchExecuteQuery,
    queryResultURI,
    queryConfig,
    satisfiedParams,
  }: LoadDataParams) {
    this.setState((state) => ({
      ...state,
      remoteQueryLoggingName: queryConfig.query,
      loadStatus: "loading",
    }))
    return new Promise((resolve, reject) => {
      return this.state.runCount >= 50
        ? resolve(void 0)
        : dispatchExecuteQuery({
            resultURI: queryResultURI,
            query: queryConfig,
            params: satisfiedParams,
          })
            .then(() => {
              this.setState((state) => ({
                ...state,
                loadStatus: "none",
                runCount: state.runCount + 1,
              }))
              resolve(void 0)
            })
            .catch((e: Error) => {
              console.error("Query.remoteQuery_executeQuery", queryConfig.query, e)
              this.setState({ loadStatus: "error", loadError: e.message })
              reject(e)
            })
    })
  }
}
