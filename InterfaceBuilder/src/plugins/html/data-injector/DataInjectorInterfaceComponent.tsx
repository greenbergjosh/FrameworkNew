import React from "react"
import { dataInjectorManageForm } from "./data-injector-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DataInjectorInterfaceComponentProps, DataInjectorInterfaceComponentState, EVENTS } from "./types"
import { set } from "lodash/fp"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { LayoutDefinition } from "../../../globalTypes"
import JSONEditor from "plugins/ant/dev-tools/components/JSONEditor"

export class DataInjectorInterfaceComponent extends BaseInterfaceComponent<
  DataInjectorInterfaceComponentProps,
  DataInjectorInterfaceComponentState
> {
  static availableEvents = [EVENTS.VALUE_CHANGED]
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
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
      this.props.valueKey !== prevProps.valueKey ||
      this.props.dataType !== prevProps.dataType ||
      this.props[typeKey] !== prevProps[typeKey]
    ) {
      this.updateValue()
    }
  }

  updateValue = () => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    const value = this.getValueByType()

    onChangeData && onChangeData(set(valueKey, value, userInterfaceData))

    this.raiseEvent(EVENTS.VALUE_CHANGED, { value })
  }

  getValueByType = (): JSONRecord | string | boolean | number => {
    const { jsonValue, booleanValue, numberValue, stringValue, dataType } = this.props

    switch (dataType) {
      case "json":
        return tryCatch(() => jsonValue && JSON.parse(jsonValue)).toUndefined()
      case "number":
        return numberValue
      case "boolean":
        return booleanValue
      default:
        // string
        return stringValue
    }
  }

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
