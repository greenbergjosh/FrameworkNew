import React from "react"
import { dataInjectorManageForm } from "./data-injector-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { DataInjectorInterfaceComponentProps, DataInjectorInterfaceComponentState } from "./types"
import { set } from "lodash/fp"
import styles from "./styles.scss"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

export class DataInjectorInterfaceComponent extends BaseInterfaceComponent<
  DataInjectorInterfaceComponentProps,
  DataInjectorInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition() {
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
    debugger
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

  render() {
    if (this.props.mode === "edit") {
      const rawValue = this.getValueByType()
      const value = this.props.dataType === "json" ? JSON.stringify(rawValue) : rawValue.toString()

      return (
        <fieldset className={styles.editMode}>
          <legend>Data Injector</legend>
          <code>
            {this.props.valueKey}: {value}
          </code>
        </fieldset>
      )
    }
    return null
  }
}