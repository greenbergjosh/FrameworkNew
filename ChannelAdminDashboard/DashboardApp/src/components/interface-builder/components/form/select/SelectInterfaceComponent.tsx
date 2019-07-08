import { Select } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import { Branded } from "io-ts"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import jsonLogic from "json-logic-js"
import JSON5 from "json5"
import { get, set } from "lodash/fp"
import React from "react"
import { KeyValuePairConfig } from "../../../../../data/AdminApi"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { QueryConfig } from "../../../../../data/Report"
import { cheapHash } from "../../../../../lib/json"
import { UserInterfaceProps } from "../../../UserInterface"
import { UserInterfaceContext } from "../../../UserInterfaceContextManager"
import { selectManageForm } from "./select-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
} from "../../base/BaseInterfaceComponent"

interface SelectOption {
  label: string
  value: string
}

type LocalDataHandlerType = "local"
type RemoteDataHandlerType = "remote-config" | "remote-kvp" | "remote-query" | "remote-url"

export interface ISelectInterfaceComponentProps extends ComponentDefinitionNamedProps {
  allowClear: boolean
  allowCreateNew?: boolean
  component: "select"
  createNewLabel: string
  defaultValue?: string
  disabled?: boolean
  multiple?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  valuePrefix?: string
  valueSuffix?: string

  dataHandlerType: LocalDataHandlerType | RemoteDataHandlerType
  data: {}
}

interface SelectInterfaceComponentPropsLocalData extends ISelectInterfaceComponentProps {
  dataHandlerType: "local"
  data: {
    values: SelectOption[]
  }
}

interface SelectInterfaceComponentPropsRemoteConfigData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote-config"
  remoteConfigType?: string
  remoteDataFilter?: JSONObject
}

interface SelectInterfaceComponentPropsRemoteKeyValueData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote-kvp"
  remoteKeyValuePair?: string
  remoteDataFilter: JSONObject
}

interface SelectInterfaceComponentPropsRemoteQueryData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote-query"
  remoteQuery?: string
  remoteDataFilter: JSONObject
}

interface SelectInterfaceComponentPropsRemoteURLData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote-url"
  remoteURL: string
}

export type SelectInterfaceComponentProps = (
  | SelectInterfaceComponentPropsLocalData
  | SelectInterfaceComponentPropsRemoteConfigData
  | SelectInterfaceComponentPropsRemoteKeyValueData
  | SelectInterfaceComponentPropsRemoteQueryData
  | SelectInterfaceComponentPropsRemoteURLData) &
  ComponentRenderMetaProps

interface SelectInterfaceComponentState {
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  options: SelectOption[]
}

export class SelectInterfaceComponent extends BaseInterfaceComponent<
  SelectInterfaceComponentProps,
  SelectInterfaceComponentState
> {
  static defaultProps = {
    allowClear: true,
    createNewLabel: "Create New...",
    valueKey: "value",
    defaultValue: "",
    placeholder: "Choose one",
    valuePrefix: "",
    valueSuffix: "",
  }

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

  static manageForm = selectManageForm

  constructor(props: SelectInterfaceComponentProps) {
    super(props)

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

  loadRemoteData = () => {
    if (
      (this.props.dataHandlerType === "remote-config" ||
        this.props.dataHandlerType === "remote-kvp" ||
        this.props.dataHandlerType === "remote-query") &&
      this.context
    ) {
      const { loadById, loadByFilter, executeQuery } = this.context
      const { remoteDataFilter } = this.props
      // console.log("SelectInterfaceComponent.loadRemoteData", this.props, loadByFilter)

      switch (this.props.dataHandlerType) {
        case "remote-config": {
          const { remoteConfigType } = this.props
          const configType =
            remoteConfigType && (remoteConfigType as Branded<string, NonEmptyStringBrand>)
          const remoteConfigTypeParent = configType && loadById(configType)
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
          if (this.props.remoteQuery) {
            const queryId = this.props.remoteQuery as Branded<string, NonEmptyStringBrand>
            const queryGlobalConfig = loadById(queryId)
            if (queryGlobalConfig) {
              const queryConfig = tryCatch(
                () => JSON5.parse(queryGlobalConfig.config.getOrElse("")) as QueryConfig
              ).toNullable()

              if (queryConfig) {
                const queryResultURI = cheapHash(queryConfig.query, {})

                // console.log("SelectInterfaceComponent.loadRemoteData", "remote-query", "execute", {
                //   resultURI: queryResultURI,
                //   query: queryConfig.query,
                //   params: {},
                // })
                executeQuery({
                  resultURI: queryResultURI,
                  query: queryConfig.query,
                  params: {},
                })
              }
            }
          }
          return
        }
        case "remote-kvp": {
          if (this.props.remoteKeyValuePair) {
            const keyValuePairId = this.props.remoteKeyValuePair as Branded<
              string,
              NonEmptyStringBrand
            >
            const keyValuePairGlobalConfig = loadById(keyValuePairId)
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
              // (console.log("SelectInterfaceComponent.getCleanValue X1", { value, anyCaseResult }),
              // 0) ||
              (value && value.toLowerCase()) === (anyCaseResult && anyCaseResult.toLowerCase())
          ) || { value: anyCaseResult }
        ).value
      )
    } else {
      return options
        ? anyCaseResult.map(
            (resultItem) =>
              (
                options.find(
                  ({ value }) =>
                    // (console.log("SelectInterfaceComponent.getCleanValue X2", {
                    //   value,
                    //   resultItem,
                    // }),
                    // 0) ||
                    (value && value.toLowerCase()) === (resultItem && resultItem.toLowerCase())
                ) || { value: resultItem }
              ).value
          )
        : anyCaseResult
    }
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

    return (
      <Select
        key={value && value.toString()}
        allowClear={allowClear}
        defaultValue={value}
        disabled={disabled}
        filterOption={(input: any, option: any) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        loading={loadStatus === "loading"}
        mode={multiple ? "multiple" : "default"}
        onChange={this.handleChange}
        optionFilterProp="label"
        placeholder={placeholder}
        showSearch>
        {options.map((option) => (
          <Select.Option key={`${option.value}`} value={option.value.toLowerCase()}>
            {option.label}
          </Select.Option>
        ))}
        {allowCreateNew && (
          <Select.Option key={`create_new_entry`} value={"create_new"}>
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
