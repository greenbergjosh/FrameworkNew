import { Icon, Select } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { reporter } from "io-ts-reporters"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import jsonLogic from "json-logic-js"
import JSON5 from "json5"
import { get, set } from "lodash/fp"
import React from "react"
import { KeyValuePairConfig } from "../../../../../../data/AdminApi"
import { Right } from "../../../../../../data/Either"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"
import { JSONRecord } from "../../../../../../data/JSON"
import { QueryConfigCodec } from "../../../../../../data/Report"
import { cheapHash } from "../../../../../../lib/json"
import { UserInterfaceContext } from "../../../../UserInterfaceContextManager"
import { BaseInterfaceComponent } from "../../../base/BaseInterfaceComponent"
import { SelectInterfaceComponentState } from "./interfaces"
import {
  modes,
  modeType,
  RemoteDataHandlerType,
  SelectInterfaceComponentProps
  } from "./types"
// import { selectManageForm } from "../../select/select-manage-form"

export class SelectInterfaceComponent extends BaseInterfaceComponent<
  SelectInterfaceComponentProps,
  SelectInterfaceComponentState
> {
  static defaultProps = {
    allowClear: true,
    createNewLabel: "Create New...",
    valueKey: "value",
    defaultValue: undefined,
    placeholder: "Choose one",
    valuePrefix: "",
    valueSuffix: "",
  }
  protected mode: modeType

  static getLayoutDefinition() {
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
  }

  static contextType = UserInterfaceContext
  context!: React.ContextType<typeof UserInterfaceContext>

  // static manageForm = selectManageForm

  constructor(props: SelectInterfaceComponentProps, mode: modeType) {
    super(props)

    this.mode = mode
    this.state = {
      loadError: null,
      loadStatus: "none",
      options: [],
    }
  }

  static getDerivedStateFromProps(
    props: SelectInterfaceComponentProps,
    state: SelectInterfaceComponentState
  ) {
    // console.log(
    //   "SelectInterfaceComponent.getDerivedStateFromProps",
    //   state.loadStatus,
    //   props.dataHandlerType,
    //   props.data
    // )
    if (state.loadStatus === "none" && props.dataHandlerType === "local") {
      return { options: (props.data && props.data.values) || [], loadStatus: "loaded" }
    }
    return null
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

  static isRemoteDataType = (dataHandlerType: string): dataHandlerType is RemoteDataHandlerType => {
    // Is the current handler type a remote data type?
    return (
      dataHandlerType === "remote-config" ||
      dataHandlerType === "remote-kvp" ||
      dataHandlerType === "remote-query" ||
      dataHandlerType === "remote-url"
    )
  }

  updateOptionsFromValues = (values: JSONRecord[]) => {
    const remoteQueryMapping =
      (this.props.dataHandlerType === "remote-query" && this.props.remoteQueryMapping) || []
    const remoteDataFilter =
      (this.props.dataHandlerType === "remote-query" && this.props.remoteDataFilter) || null
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

  loadRemoteData = () => {
    if (
      (this.props.dataHandlerType === "remote-config" ||
        this.props.dataHandlerType === "remote-kvp" ||
        this.props.dataHandlerType === "remote-query") &&
      this.context
    ) {
      const { loadById, loadByFilter, executeQuery, reportDataByQuery } = this.context
      const { hidden, remoteDataFilter } = this.props

      // console.log("SelectInterfaceComponent.render", { reportDataByQuery })

      switch (this.props.dataHandlerType) {
        case "remote-config": {
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
              const queryConfig = QueryConfigCodec.decode(
                JSON5.parse(queryGlobalConfig.config.getOrElse(""))
              )
              queryConfig.fold(
                (errors) => {
                  console.error(
                    "SelectInterfaceComponent.render",
                    "Invalid Query",
                    reporter(queryConfig)
                  )
                },
                Right((queryConfig) => {
                  // console.log(
                  //   "SelectInterfaceComponent.render",
                  //   "Checking for loaded values",
                  //   queryConfig
                  // )

                  const parameterValues = queryConfig.parameters.reduce(
                    (acc, { name, defaultValue }) => (
                      (acc[name] = defaultValue && defaultValue.toNullable()), acc
                    ),
                    {} as JSONObject
                  )
                  const queryResultURI = cheapHash(queryConfig.query, parameterValues)

                  const queryResult = record.lookup(queryResultURI, reportDataByQuery)

                  queryResult.foldL(
                    () => {
                      // console.log("SelectInterfaceComponent.render", "Loading")
                      this.setState({ loadStatus: "loading" })
                      executeQuery({
                        resultURI: queryResultURI,
                        query: queryConfig.query,
                        params: parameterValues,
                      })
                        .then(() => {
                          // console.log("SelectInterfaceComponent.render", "Clear loading state")
                          this.setState({ loadStatus: "none" })
                        })
                        .catch((e: Error) => {
                          console.error(
                            "SelectInterfaceComponent.render",
                            "Set error loading state",
                            e
                          )
                          this.setState({ loadStatus: "error", loadError: e.message })
                        })
                    },
                    (resultValues) => {
                      // console.log("SelectInterfaceComponent.render", "Loaded, no remote")
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
                () =>
                  JSON5.parse(keyValuePairGlobalConfig.config.getOrElse("")) as KeyValuePairConfig
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
      }

      console.warn("Failed to load remote data for", this.props)
      this.setState({ options: [] })
    }
  }

  componentDidMount() {
    // If the data type is remote, load the data
    if (SelectInterfaceComponent.isRemoteDataType(this.props.dataHandlerType)) {
      this.loadRemoteData()
    }
  }

  componentDidUpdate(
    prevProps: SelectInterfaceComponentProps,
    prevState: SelectInterfaceComponentState
  ) {
    // console.log("SelectInterfaceComponent.componentDidUpdate", {
    //   was: prevState.loadStatus,
    //   is: this.state.loadStatus,
    // })
    // If the data handler type has changed, and the new type is remote
    // or if the remote config type has changed
    // or if the remote query has changed
    if (
      (this.props.dataHandlerType !== prevProps.dataHandlerType ||
        (this.props.dataHandlerType === "remote-config" &&
          prevProps.dataHandlerType === "remote-config" &&
          this.props.remoteConfigType !== prevProps.remoteConfigType) ||
        (this.props.dataHandlerType === "remote-query" &&
          prevProps.dataHandlerType === "remote-query" &&
          this.props.remoteQuery !== prevProps.remoteQuery) ||
        (this.props.dataHandlerType === "remote-kvp" &&
          prevProps.dataHandlerType === "remote-kvp" &&
          this.props.remoteKeyValuePair !== prevProps.remoteKeyValuePair)) &&
      SelectInterfaceComponent.isRemoteDataType(this.props.dataHandlerType)
    ) {
      this.loadRemoteData()
    } else if (
      SelectInterfaceComponent.isRemoteDataType(this.props.dataHandlerType) &&
      this.state.loadStatus === "none" &&
      prevState.loadStatus === "loading"
    ) {
      this.loadRemoteData()
    }
  }

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

    // console.log("SelectInterfaceComponent.getCleanValue", { anyCaseResult, options })
    if (!Array.isArray(anyCaseResult)) {
      return (
        options &&
        (
          options.find(
            ({ value }) =>
              value === anyCaseResult ||
              (typeof value === "string" && value.toLowerCase()) ===
                (anyCaseResult && anyCaseResult.toLowerCase())
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
                  (typeof value === "string" && value.toLowerCase()) ===
                    (resultItem && resultItem.toLowerCase())
              ) || { value: resultItem }
            ).value
        )
      : anyCaseResult
  }

  render(): JSX.Element {
    const {
      allowClear,
      allowCreateNew,
      createNewLabel,
      disabled,
      multiple,
      placeholder,
    } = this.props
    const { loadStatus, options } = this.state

    const value = this.getCleanValue()

    let mode = this.mode
    if (mode !== modes.tags) {
      mode = multiple ? modes.multiple : modes.default
    }

    return (
      <Select
        key={value && value.toString()}
        allowClear={allowClear}
        defaultValue={value}
        disabled={disabled}
        filterOption={(input: any, option: any) =>
          // When switching about the internals of component during configuration time, the type of children can change
          typeof option.props.children.toLowerCase === "function" &&
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        loading={loadStatus === "loading"}
        mode={mode}
        onChange={this.handleChange}
        optionFilterProp="label"
        placeholder={placeholder}
        showSearch>
        {options.map((option) => (
          <Select.Option key={`${option.value}`} value={option.value}>
            {typeof option.icon !== "undefined" ? (
              <Icon type={option.icon} style={{ marginRight: "8px" }} />
            ) : null}
            {option.label}
          </Select.Option>
        ))}
        {allowCreateNew && (
          <Select.Option key="create_new_entry" value="create_new">
            {createNewLabel}
          </Select.Option>
        )}
      </Select>
    )
  }
}

const cleanText = (text: string, prefix?: string, suffix?: string) => {
  const noPrefix = text && prefix && text.startsWith(prefix) ? text.substring(prefix.length) : text
  const noSuffix =
    noPrefix && suffix && noPrefix.endsWith(suffix)
      ? noPrefix.substr(0, noPrefix.length - suffix.length)
      : noPrefix

  return noSuffix
}
