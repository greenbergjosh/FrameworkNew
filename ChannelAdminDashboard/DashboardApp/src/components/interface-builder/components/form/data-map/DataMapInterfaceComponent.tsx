import { DatePicker } from "antd"
import { RangePickerValue } from "antd/lib/date-picker/interface"
import { get, set } from "lodash/fp"
import moment from "moment"
import React from "react"
import { DataMap } from "../../../../data-map/DataMap"
import { DataPathContext } from "../../../../DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { RenderInterfaceComponent } from "../../../RenderInterfaceComponent"
import { UserInterface, UserInterfaceProps } from "../../../UserInterface"
import { dataMapManageForm } from "./data-map-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

export interface DataMapInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "data-map"
  count?: number
  defaultValue: any[]
  keyComponent: ComponentDefinition
  multiple?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueComponent: ComponentDefinition
  valueKey: string
}

interface DataMapInterfaceComponentState {}

export class DataMapInterfaceComponent extends BaseInterfaceComponent<
  DataMapInterfaceComponentProps,
  DataMapInterfaceComponentState
> {
  static defaultProps = {
    keyComponent: {
      hideLabel: false,
      label: "Value",
      component: "input",
      valueKey: "key",
    },
    multiple: true,
    valueComponent: {
      hideLabel: false,
      label: "Label",
      component: "input",
      valueKey: "value",
    },
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "data-map",
      title: "Data Map",
      icon: "appstore",
      formControl: true,
      componentDefinition: {
        component: "data-map",
        label: "Data Map",
      },
    }
  }

  static manageForm = dataMapManageForm

  static getDefintionDefaultValue({  }: DataMapInterfaceComponentProps) {
    return []
  }

  handleChange = (dates: RangePickerValue, dateStrings: [string, string]) => {
    const { onChangeData, userInterfaceData } = this.props

    onChangeData && onChangeData({ ...userInterfaceData })
  }

  render(): JSX.Element {
    const {
      count,
      defaultValue,
      keyComponent,
      multiple,
      onChangeData,
      userInterfaceData,
      valueComponent,
      valueKey,
    } = this.props
    const values = get(valueKey, userInterfaceData) || defaultValue
    return (
      <DataMap
        count={count}
        data={values}
        keyLabel={keyComponent.label}
        onDataChanged={(newData) =>
          onChangeData && onChangeData(set(valueKey, newData, userInterfaceData))
        }
        multiple={multiple}
        renderKeyComponent={(dataItem, onChangeData) => {
          return (
            <DataPathContext path="keyComponent">
              <ComponentRenderer
                componentLimit={1}
                components={[{ ...keyComponent, hideLabel: true }]}
                data={dataItem}
                onChangeData={onChangeData}
              />
            </DataPathContext>
          )
        }}
        renderValueComponent={(dataItem, onChangeData) => {
          return (
            <DataPathContext path="valueComponent">
              <ComponentRenderer
                componentLimit={1}
                components={[{ ...valueComponent, hideLabel: true }]}
                data={dataItem}
                onChangeData={onChangeData}
              />
            </DataPathContext>
          )
        }}
        valueLabel={valueComponent.label}
      />
    )
  }
}
