import { get, set } from "lodash/fp"
import React from "react"
import { DataMap } from "./DataMap"
import { DataPathContext } from "../../../contexts/DataPathContext"
import { ComponentRenderer } from "components/ComponentRenderer/ComponentRenderer"
import { dataMapManageForm } from "./data-map-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../../globalTypes"

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

  static getLayoutDefinition(): LayoutDefinition {
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

  render(): JSX.Element {
    const {
      count,
      defaultValue,
      keyComponent,
      multiple,
      onChangeData,
      userInterfaceData,
      getRootUserInterfaceData,
      setRootUserInterfaceData,
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
          (console.log("DataMapInterfaceComponent.onDataChanged", {
            valueKey,
            newData,
            userInterfaceData,
            result: set(valueKey, newData, userInterfaceData),
          }),
          0) ||
          (onChangeData && onChangeData(set(valueKey, newData, userInterfaceData)))
        }
        multiple={multiple}
        renderKeyComponent={(dataItem, onChangeData) => {
          return (
            <DataPathContext path="keyComponent">
              <ComponentRenderer
                componentLimit={1}
                components={[{ ...keyComponent, hideLabel: true, getRootUserInterfaceData, setRootUserInterfaceData }]}
                data={dataItem}
                getRootData={getRootUserInterfaceData}
                setRootData={setRootUserInterfaceData}
                onChangeData={onChangeData}
                onChangeSchema={(newSchema) => {
                  console.warn(
                    "DataMapInterfaceComponent.render",
                    "TODO: Cannot alter schema inside ComponentRenderer in DataMap",
                    { newSchema }
                  )
                }}
              />
            </DataPathContext>
          )
        }}
        renderValueComponent={(dataItem, onChangeData) => {
          return (
            <DataPathContext path="valueComponent">
              <ComponentRenderer
                componentLimit={1}
                components={[
                  { ...valueComponent, hideLabel: true, getRootUserInterfaceData, setRootUserInterfaceData },
                ]}
                data={dataItem}
                getRootData={getRootUserInterfaceData}
                setRootData={setRootUserInterfaceData}
                onChangeData={onChangeData}
                onChangeSchema={(newSchema) => {
                  console.warn(
                    "DataMapInterfaceComponent.render",
                    "TODO: Cannot alter schema inside ComponentRenderer in DataMap",
                    { newSchema }
                  )
                }}
              />
            </DataPathContext>
          )
        }}
        valueLabel={valueComponent.label}
      />
    )
  }
}
