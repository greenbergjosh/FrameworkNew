import { get, intersectionWith, isEqual } from "lodash/fp"
import React from "react"
import { JSONRecord } from "../../../../globalTypes/JSONTypes"
import { UserInterfaceContext } from "../../../../contexts/UserInterfaceContext"
import { BaseInterfaceComponent } from "../../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { SelectableChildProps, SelectableOption, SelectableProps, SelectableState } from "./types"

export class Selectable extends BaseInterfaceComponent<SelectableProps, SelectableState> {
  static defaultProps = {
    createNewLabel: "Create New...",
    defaultValue: undefined,
    valueKey: "value",
    valuePrefix: "",
    valueSuffix: "",
  }

  /*static getLayoutDefinition(): LayoutDefinition {
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

  handleChange = (value: string | string[]): void => {
    const { valueKey, valuePrefix, valueSuffix } = this.props
    const newValue =
      valuePrefix || valueSuffix
        ? Array.isArray(value)
          ? value.map((v) => `${valuePrefix}${v}${valueSuffix}`)
          : `${valuePrefix}${value}${valueSuffix}`
        : value

    this.setValue([valueKey, newValue])
  }

  /**
   *
   * @param values
   */
  updateOptionsFromValues = (values: JSONRecord[]) => {
    const labelKey = "label"
    const valueKey = "value"

    const valueSet = new Set<string>()
    this.setState({
      options: values
        .filter((value) => {
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

  // componentDidMount() {}

  // componentDidUpdate(prevProps: SelectableProps, prevState: SelectableState) { }

  /**
   *
   */
  getCleanValue = () => {
    const { defaultValue, valuePrefix, valueSuffix } = this.props
    const { options } = this.state
    const rawValue = this.getValue(this.props.valueKey) || defaultValue || ""

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
