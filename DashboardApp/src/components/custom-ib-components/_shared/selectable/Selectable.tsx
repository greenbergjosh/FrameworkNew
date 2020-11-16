import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { reporter } from "io-ts-reporters"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import jsonLogic from "json-logic-js"
import JSON5 from "json5"
import { get, set, intersectionWith, isEqual } from "lodash/fp"
import React from "react"
import { AdminUserInterfaceContextManager } from "../../../../data/AdminUserInterfaceContextManager.type"
import { PersistedConfig } from "../../../../data/GlobalConfig.Config"
import { QueryConfigCodec } from "../../../../data/Report"
import { BaseInterfaceComponent, cheapHash, JSONRecord, Right, UserInterfaceContext } from "@opg/interface-builder"
import {
  KeyValuePairConfig,
  RemoteDataHandlerType,
  SelectableChildProps,
  SelectableOption,
  SelectableProps,
  SelectablePropsUiDataKey,
  SelectableState,
} from "./types"
import * as remoteFunctionDataHandler from "./dataHandlers/remoteFunction"

export class Selectable extends BaseInterfaceComponent<SelectableProps, SelectableState> {
  static defaultProps = {
    createNewLabel: "Create New...",
    defaultValue: undefined,
    valueKey: "value",
    valuePrefix: "",
    valueSuffix: "",
  }

  /*static getLayoutDefinition() {
    return {
      category: "Form",
      name: "select",
      title: "Select",
      icon: "bars",
      formControl: true,
      componentDefinition: {
        component: "select",
        label: "Select",
      },
    }
  }*/

  static contextType = UserInterfaceContext
  context!: React.ContextType<typeof UserInterfaceContext>

  // static manageForm = selectManageForm

  constructor(props: SelectableProps) {
    super(props)

    this.state = {
      loadError: null,
      loadStatus: "none",
      options: [],
    }
  }

  static getDerivedStateFromProps(props: SelectableProps, state: SelectableState) {
    // console.log(
    //   "Selectable.getDerivedStateFromProps",
    //   state.loadStatus,
    //   props.dataHandlerType,
    //   props.data
    // )
    if (
      props.dataHandlerType === "local" &&
      Selectable.optionsDidChange(props.data && props.data.values, state.options)
    ) {
      return {
        options: (props.data && props.data.values) || [],
        loadStatus: "loaded",
      }
    }
    return null
  }

  private static optionsDidChange(values: SelectableOption[], options: SelectableOption[]) {
    const intersection = intersectionWith(isEqual, values, options)
    return intersection.length !== values.length || values.length !== options.length
  }

  handleChange = (value: string | string[]) => {
    const { onChangeData, userInterfaceData, valueKey, valuePrefix, valueSuffix } = this.props
    const newValue =
      valuePrefix || valueSuffix
        ? Array.isArray(value)
          ? value.map((v) => `${valuePrefix}${v}${valueSuffix}`)
          : `${valuePrefix}${value}${valueSuffix}`
        : value

    onChangeData && onChangeData(set(valueKey, newValue, userInterfaceData))
  }

  /**
   * Determines if dataHandlerType is Remote Data ("remote-config", "remote-kvp", "remote-query", "remote-function")
   * @param dataHandlerType
   */
  static isRemoteDataType = (dataHandlerType: string): dataHandlerType is RemoteDataHandlerType => {
    // Is the current handler type a remote data type?
    return (
      dataHandlerType === "remote-config" ||
      dataHandlerType === "remote-kvp" ||
      dataHandlerType === "remote-query" ||
      dataHandlerType === "remote-url" ||
      dataHandlerType === "remote-function"
    )
  }

  /**
   *
   * @param values
   */
  updateOptionsFromValues = (values: JSONRecord[]) => {
    const remoteQueryMapping = (this.props.dataHandlerType === "remote-query" && this.props.remoteQueryMapping) || []
    const remoteDataFilter = (this.props.dataHandlerType === "remote-query" && this.props.remoteDataFilter) || null
    const labelKey =
      (
        remoteQueryMapping.find(({ label }) => label === "label") || {
          value: "label",
        }
      ).value || "label"
    const valueKey =
      (
        remoteQueryMapping.find(({ label }) => label === "value") || {
          value: "value",
        }
      ).value || "value"

    const valueSet = new Set<string>()
    this.setState({
      options: values
        .filter((value) => {
          if (remoteDataFilter && !jsonLogic.apply(remoteDataFilter, value)) {
            return false
          }
          const stringValue = String(get(valueKey, value))
          if (!valueSet.has(stringValue)) {
            valueSet.add(stringValue)
            return true
          }

          return false
        })
        .map((value, index) => ({
          label: (get(labelKey, value) as string) || `Option ${index + 1}`,
          value: String(get(valueKey, value)),
        })),
      loadStatus: "loaded",
    })
  }

  /**
   * Loads data when component is configured to use Remote Data
   * ("remote-config", "remote-kvp", "remote-query", "remote-function")
   */
  loadRemoteData = (eventType?: string) => {
    if (
      (this.props.dataHandlerType === "remote-config" ||
        this.props.dataHandlerType === "remote-kvp" ||
        this.props.dataHandlerType === "remote-query" ||
        this.props.dataHandlerType === "remote-function") &&
      this.context
    ) {
      const { loadById, loadByFilter, executeQuery, reportDataByQuery } = this
        .context as AdminUserInterfaceContextManager
      const { hidden, remoteDataFilter } = this.props

      // console.log("Selectable.render", { reportDataByQuery })

      switch (this.props.dataHandlerType) {
        case "remote-config": {
          const { remoteConfigType } = this.props
          const remoteConfigTypeParent = remoteConfigType && loadById(remoteConfigType)
          const remoteConfigTypeParentName = remoteConfigTypeParent && remoteConfigTypeParent.name

          const predicate = remoteDataFilter
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
            ? (config: PersistedConfig) =>
                config.type === remoteConfigType || config.type === remoteConfigTypeParentName
            : (config: PersistedConfig) => true

          const options = loadByFilter(predicate).map(({ id, name }) => ({
            label: name,
            value: id,
          }))
          this.setState({ options })
          return
        }
        case "remote-query": {
          const { remoteQuery, remoteQueryMapping } = this.props

          if (!hidden && remoteQuery) {
            const queryGlobalConfig = loadById(remoteQuery)
            if (queryGlobalConfig) {
              const queryConfig = QueryConfigCodec.decode(JSON5.parse(queryGlobalConfig.config.getOrElse("")))
              queryConfig.fold(
                (errors) => {
                  console.error("Selectable.render", "Invalid Query", reporter(queryConfig))
                },
                Right((queryConfig) => {
                  // console.log(
                  //   "Selectable.render",
                  //   "Checking for loaded values",
                  //   queryConfig
                  // )

                  const parameterValues = queryConfig.parameters.reduce(
                    (acc, { name, defaultValue }) => ((acc[name] = defaultValue && defaultValue.toNullable()), acc),
                    {} as JSONObject
                  )
                  const queryResultURI = cheapHash(queryConfig.query, parameterValues)

                  const queryResult = record.lookup(queryResultURI, reportDataByQuery)

                  queryResult.foldL(
                    () => {
                      // console.log("Selectable.render", "Loading")
                      this.setState({ loadStatus: "loading" })
                      executeQuery({
                        resultURI: queryResultURI,
                        query: queryConfig,
                        params: parameterValues,
                      })
                        .then(() => {
                          // console.log("Selectable.render", "Clear loading state")
                          this.setState({ loadStatus: "none" })
                        })
                        .catch((e: Error) => {
                          console.error("Selectable.render", "Set error loading state", e)
                          this.setState({ loadStatus: "error", loadError: e.message })
                        })
                    },
                    (resultValues) => {
                      // console.log("Selectable.render", "Loaded, no remote")
                      this.updateOptionsFromValues(resultValues)
                    }
                  )
                })
              )
            }
          }
          return
        }
        case "remote-kvp": {
          if (this.props.remoteKeyValuePair) {
            const keyValuePairGlobalConfig = loadById(this.props.remoteKeyValuePair)
            if (keyValuePairGlobalConfig) {
              const keyValuePairConfig = tryCatch(
                () => JSON5.parse(keyValuePairGlobalConfig.config.getOrElse("")) as KeyValuePairConfig
              ).toNullable()

              if (keyValuePairConfig) {
                const options =
                  keyValuePairConfig.items &&
                  keyValuePairConfig.items.map(({ key: value, value: label }) => ({ label, value }))
                this.setState({ options })
              }
            }
          }
          return
        }
        case "remote-function": {
          /*
           * Reset state.remoteFunction so that it will refresh in the onFocus handler.
           * We don't fetch the remote-function options until the user interacts
           * with the component because it can be an expensive operation.
           */
          if (eventType === "changedRemoteDataHandlerType" && this.state.remoteFunction) {
            this.setState({ remoteFunction: undefined })
          }
          return
        }
      }

      console.warn("Failed to load remote data for", this.props)
      this.setState({ options: [] })
    }
  }

  private loadOptionsFromUIData(prevProps?: SelectableProps) {
    const { optionsKey, optionLabelKey, optionValueKey } = this.props as SelectablePropsUiDataKey

    if (!optionsKey) {
      // Can't do much without an optionsKey
      return
    }

    const getRawOptions = (props: SelectableProps): JSONRecord[] => {
      const p = props as SelectablePropsUiDataKey
      return p.optionsKey && this.getValue(p.optionsKey, p.userInterfaceData, p.getRootUserInterfaceData)
    }

    const rawOptions = getRawOptions(this.props)
    let isOptionsChanged = true

    // If this is an update, then check prevProps
    if (prevProps) {
      const prevRawOptions = getRawOptions(prevProps)
      isOptionsChanged = !prevRawOptions || !isEqual(rawOptions, prevRawOptions)
    }

    if (isOptionsChanged && Array.isArray(rawOptions)) {
      const options = formatOptions(rawOptions, optionLabelKey, optionValueKey)
      this.setState({ options })
    }
  }

  private isOptionsKeyUpdated(prevProps: SelectableProps) {
    return (
      this.props.optionsKey !== prevProps.optionsKey ||
      this.props.optionsLabelKey !== prevProps.optionsLabelKey ||
      this.props.optionsValueKey !== prevProps.optionsValueKey ||
      this.props.userInterfaceData !== prevProps.userInterfaceData
    )
  }

  componentDidMount() {
    // If the data type is remote, load the data
    if (Selectable.isRemoteDataType(this.props.dataHandlerType)) {
      this.loadRemoteData("componentDidMount")
    }
    // If the data type is ui-data-key, get options from userInterfaceData
    if (this.props.dataHandlerType === "ui-data-key") {
      this.loadOptionsFromUIData()
    }
  }

  componentDidUpdate(prevProps: SelectableProps, prevState: SelectableState) {
    if (this.props.dataHandlerType === "ui-data-key" && this.isOptionsKeyUpdated(prevProps)) {
      this.loadOptionsFromUIData(prevProps)
    }

    const isRemoteConfigUpdated = () =>
      this.props.dataHandlerType === "remote-config" &&
      prevProps.dataHandlerType === "remote-config" &&
      this.props.remoteConfigType !== prevProps.remoteConfigType

    const isRemoteQueryUpdated = () =>
      this.props.dataHandlerType === "remote-query" &&
      prevProps.dataHandlerType === "remote-query" &&
      this.props.remoteQuery !== prevProps.remoteQuery

    const isRemoteKVPUpdated = () =>
      this.props.dataHandlerType === "remote-kvp" &&
      prevProps.dataHandlerType === "remote-kvp" &&
      this.props.remoteKeyValuePair !== prevProps.remoteKeyValuePair

    const isRemoteFunctionUpdated = () =>
      this.props.dataHandlerType === "remote-function" &&
      prevProps.dataHandlerType === "remote-function" &&
      this.props.remoteFunctionType !== prevProps.remoteFunctionType

    const isRemoteDataHandlerTypeChanged = () =>
      this.props.dataHandlerType !== prevProps.dataHandlerType ||
      isRemoteConfigUpdated() ||
      isRemoteQueryUpdated() ||
      isRemoteKVPUpdated() ||
      isRemoteFunctionUpdated()

    // console.log("Selectable.componentDidUpdate", {
    //   was: prevState.loadStatus,
    //   is: this.state.loadStatus,
    // })

    if (isRemoteDataHandlerTypeChanged() && Selectable.isRemoteDataType(this.props.dataHandlerType)) {
      // The data handler type has changed and the new type is remote
      this.loadRemoteData("changedRemoteDataHandlerType")
    } else if (
      Selectable.isRemoteDataType(this.props.dataHandlerType) &&
      this.state.loadStatus === "none" &&
      prevState.loadStatus === "loading"
    ) {
      this.loadRemoteData("loaded")
    }
  }

  handleFocus() {
    /*
     * We fetch the remote-function options onFocus because it can be an expensive operation
     * on a form with many Selectable components.
     */
    if (this.props.dataHandlerType === "remote-function" && !this.state.remoteFunction) {
      const remoteFunction = remoteFunctionDataHandler.loadRemoteFunction(
        (this.context as AdminUserInterfaceContextManager).loadById,
        this.props.remoteFunctionType
      )
      const options = remoteFunction
        ? remoteFunctionDataHandler.getOptions(
            this.props.userInterfaceData,
            this.props.getRootUserInterfaceData,
            remoteFunction
          )
        : []
      this.setState({ options, remoteFunction })
    }
  }

  /**
   *
   */
  getCleanValue = () => {
    const { defaultValue, userInterfaceData, valueKey, valuePrefix, valueSuffix } = this.props
    const { options } = this.state

    const rawValue =
      typeof get(valueKey, userInterfaceData) !== "undefined"
        ? (get(valueKey, userInterfaceData) as string | string[])
        : defaultValue

    const anyCaseResult =
      rawValue &&
      (Array.isArray(rawValue)
        ? rawValue.map(
            (value) => cleanText(value, valuePrefix, valueSuffix) //.toLowerCase()
          )
        : cleanText(rawValue, valuePrefix, valueSuffix)) //.toLowerCase()

    // console.log("Selectable.getCleanValue", { anyCaseResult, options })
    if (!Array.isArray(anyCaseResult)) {
      return (
        options &&
        (
          options.find(
            ({ value }) =>
              value === anyCaseResult ||
              (typeof value === "string" && value.toLowerCase()) === (anyCaseResult && anyCaseResult.toLowerCase())
          ) || { value: anyCaseResult }
        ).value
      )
    }
    return options
      ? anyCaseResult.map(
          (resultItem) =>
            (
              options.find(
                ({ value }) =>
                  value === resultItem ||
                  (typeof value === "string" && value.toLowerCase()) === (resultItem && resultItem.toLowerCase())
              ) || { value: resultItem }
            ).value
        )
      : anyCaseResult
  }

  render(): JSX.Element {
    const { allowCreateNew, createNewLabel, disabled } = this.props
    const { loadStatus, options, loadError } = this.state
    const selectableChildProps: SelectableChildProps = {
      allowCreateNew,
      createNewLabel,
      disabled,
      options,
      getCleanValue: this.getCleanValue,
      loadStatus,
      loadError,
      handleFocus: this.handleFocus.bind(this),
    }

    return <>{this.props.children && this.props.children(selectableChildProps)}</>
  }
}

const cleanText = (text: string, prefix?: string, suffix?: string) => {
  const noPrefix = text && prefix && text.startsWith(prefix) ? text.substring(prefix.length) : text
  const noSuffix =
    noPrefix && suffix && noPrefix.endsWith(suffix) ? noPrefix.substr(0, noPrefix.length - suffix.length) : noPrefix

  return noSuffix
}

function formatOptions(
  rawOptions: JSONRecord[],
  optionLabelKey: string | undefined,
  optionValueKey: string | undefined
) {
  const init: SelectableOption[] = []
  const options = rawOptions.reduce((acc, item) => {
    const label = get(optionLabelKey || "label", item) as string
    const value = get(optionValueKey || "value", item) as string

    if (label && value) acc.push({ label, value })
    return acc
  }, init)
  return options
}
