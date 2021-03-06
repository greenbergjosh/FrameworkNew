import React from "react"
import { settings } from "./settings"
import {
  BaseInterfaceComponent,
  JSONEditor,
  JSONEditorProps,
  JSONRecord,
  LayoutDefinition,
} from "@opg/interface-builder"
import { DataInjectorInterfaceComponentProps, DataInjectorInterfaceComponentState, EVENTS } from "./types"
import { isEqual, isObjectLike, isString, isUndefined, set } from "lodash/fp"
import { tryCatch } from "fp-ts/lib/Option"
import layoutDefinition from "./layoutDefinition"

export default class DataInjectorInterfaceComponent extends BaseInterfaceComponent<
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
    return layoutDefinition
  }

  static manageForm = settings

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
    const key = this.props.outboundValueKey || this.props.valueKey // retaining valueKey for backwards compatibility
    this.setValue([key, value])
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
         * Handle a json object
         */
        if (!isUndefined(jsonValue) && typeof jsonValue === "object" && isObjectLike(jsonValue)) {
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
            { jsonValue }
          )
          return null
        }

        /*
         * jsonValue is an invalid type
         */
        console.warn(
          "DataInjectorInterfaceComponent.getValueByType",
          `Data type "json" expected a valid json string or object but got a ${typeof jsonValue} instead.`,
          { jsonValue }
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
   * @param data
   */
  handleChange: JSONEditorProps["onChange"] = (data): void => {
    if (this.props.mode === "edit") {
      const { onChangeSchema, userInterfaceSchema } = this.props
      const jsonValue = JSON.stringify(data || {})
      onChangeSchema && userInterfaceSchema && onChangeSchema(set("jsonValue", jsonValue, userInterfaceSchema))
    }
  }

  render(): JSX.Element | null {
    if (this.props.mode === "edit") {
      const rawValue = this.getValueByType() as JSONRecord

      const fieldsetStyle: React.CSSProperties = {
        padding: "5px",
        backgroundColor: "rgba(180, 0, 255, 0.05)",
        display: "inline-block",
        width: "100%",
        overflow: "scroll",
      }

      return (
        <fieldset style={fieldsetStyle}>
          <div style={{ fontSize: 10, color: "rgb(172 177 180)" }}>
            <strong>Outbound Value Key:</strong> {this.props.outboundValueKey}
          </div>
          <div
            style={{
              marginTop: 5,
              borderRadius: 3,
              backgroundColor: "white",
            }}>
            {this.props.dataType === "json" ? (
              <JSONEditor data={rawValue} onChange={this.handleChange} height={this.props.height || 100} />
            ) : (
              <pre>{rawValue}</pre>
            )}
          </div>
        </fieldset>
      )
    }
    return null
  }
}
