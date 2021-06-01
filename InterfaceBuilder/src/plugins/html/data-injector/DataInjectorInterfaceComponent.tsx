import React from "react"
import { dataInjectorManageForm } from "./data-injector-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DataInjectorInterfaceComponentProps, DataInjectorInterfaceComponentState, EVENTS } from "./types"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { LayoutDefinition } from "../../../globalTypes"
import JSONEditor from "plugins/ant/dev-tools/components/JSONEditor"
import { isObjectLike, isString, isUndefined, isEqual } from "lodash/fp"

export class DataInjectorInterfaceComponent extends BaseInterfaceComponent<
  DataInjectorInterfaceComponentProps,
  DataInjectorInterfaceComponentState
> {
  static availableEvents = [EVENTS.VALUE_CHANGED]
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "$", // deprecated, use outboundValueKey instead
    outboundValueKey: "$",
    showBorder: true,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Special",
      name: "data-injector",
      title: "Data Injector",
      icon: "import",
      description: ``,
      componentDefinition: {
        component: "data-injector",
        components: [],
      },
    }
  }

  static manageForm = dataInjectorManageForm

  componentDidMount(): void {
    this.updateValue()
  }

  componentDidUpdate(prevProps: Readonly<DataInjectorInterfaceComponentProps>): void {
    let typeKey: string
    switch (this.props.dataType) {
      case "json":
        typeKey = "jsonValue"
        break
      case "number":
        typeKey = "numberValue"
        break
      case "boolean":
        typeKey = "booleanValue"
        break
      default:
        // string
        typeKey = "stringValue"
    }

    if (
      this.props.outboundValueKey !== prevProps.outboundValueKey ||
      this.props.dataType !== prevProps.dataType ||
      !isEqual(this.props[typeKey], prevProps[typeKey])
    ) {
      this.updateValue()
    }
  }

  /**
   * Display mode method to put stored values into the model
   */
  updateValue = () => {
    const value = this.getValueByType()
    const key = this.props.outboundValueKey || this.props.valueKey // retain valueKey for backwards compatibility
    this.setValue(key, value)
    this.raiseEvent(EVENTS.VALUE_CHANGED, { value })
  }

  getValueByType = (): JSONRecord | string | boolean | number | null => {
    const { jsonValue, booleanValue, numberValue, stringValue, dataType, bindings } = this.props

    switch (dataType) {
      case "json":
        /*
         * Handle a bound json object
         */
        if (!isUndefined(bindings && bindings.jsonValue) && typeof jsonValue === "object" && isObjectLike(jsonValue)) {
          return jsonValue
        }

        /*
         * Parse a json string from either the settings or bound data
         */
        if (isString(jsonValue)) {
          const json: JSONRecord | undefined = tryCatch(() => jsonValue && JSON.parse(jsonValue)).toUndefined()
          if (json && isObjectLike(json)) {
            return json
          }
          // jsonValue is an invalid json string
          console.warn(
            "DataInjectorInterfaceComponent.getValueByType",
            `Data type "json" expected a valid json string.`,
            { value: jsonValue }
          )
          return null
        }

        /*
         * jsonValue is an invalid type
         */
        console.warn(
          "DataInjectorInterfaceComponent.getValueByType",
          `Data type "json" expected a valid json string or object but got a ${typeof jsonValue} instead.`,
          { value: jsonValue }
        )
        return null
      case "number":
        return numberValue
      case "boolean":
        return booleanValue
      default:
        // string
        return stringValue
    }
  }

  /**
   * Edit mode change event handler
   * @param userInterfaceData
   */
  handleChange = (userInterfaceData: any): void => {
    const { onChangeData } = this.props
    onChangeData && onChangeData(userInterfaceData)
  }

  render(): JSX.Element | null {
    if (this.props.mode === "edit") {
      const rawValue = this.getValueByType() as JSONRecord

      return <JSONEditor data={rawValue} onChange={this.handleChange} height={this.props.height || 100} />
    }
    return null
  }
}
