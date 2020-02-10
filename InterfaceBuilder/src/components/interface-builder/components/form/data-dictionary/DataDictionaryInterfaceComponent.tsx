import { get, set } from "lodash/fp"
import React from "react"
import { DataMap } from "../data-map/DataMap"
import { DataPathContext } from "../../../util/DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { dataDictionaryManageForm } from "./data-dictionary-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface DataDictionaryInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "data-dictionary"
  defaultValue?: any
  keyLabel?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueComponent: [ComponentDefinition]
  valueKey: string
}

interface DataDictionaryInterfaceComponentState {}

export class DataDictionaryInterfaceComponent extends BaseInterfaceComponent<
  DataDictionaryInterfaceComponentProps,
  DataDictionaryInterfaceComponentState
> {
  static defaultProps = {
    keyLabel: "Key",
    valueComponent: [
      {
        hideLabel: false,
        label: "Label",
        component: "input",
        valueKey: "value",
      },
    ],
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "data-dictionary",
      title: "Data Dictionary",
      icon: "book",
      formControl: true,
      componentDefinition: {
        component: "data-dictionary",
      },
    }
  }

  static manageForm = dataDictionaryManageForm

  render(): JSX.Element {
    const {
      defaultValue,
      keyLabel,
      onChangeData,
      userInterfaceData,
      valueComponent,
      valueKey,
    } = this.props
    const dictionary = get(valueKey, userInterfaceData) || defaultValue
    const values = dictionary && Object.entries(dictionary).map(([key, value]) => ({ key, value }))
    return (
      <DataMap
        data={values}
        keyLabel={keyLabel}
        multiple
        onDataChanged={(newData) => {
          const newValue = newData.reduce(
            (acc, item: any) => {
              acc[item.key] = typeof item.value === "undefined" ? null : item.value
              return acc
            },
            {} as any
          )

          onChangeData && onChangeData(set(valueKey, newValue, userInterfaceData))
        }}
        renderKeyComponent={(dataItem, onChangeData) => {
          return (
            <DataPathContext path="keyComponent">
              <ComponentRenderer
                componentLimit={1}
                components={[
                  {
                    key: "dataDictionaryKey",
                    component: "input",
                    valueKey: "key",
                    hideLabel: true,
                  },
                ]}
                data={dataItem}
                mode="display"
                onChangeData={onChangeData}
                onChangeSchema={(newSchema) => {
                  console.warn(
                    "DataDictionaryInterfaceComponent.render",
                    "TODO: Cannot alter schema inside ComponentRenderer in DataDictionary",
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
                components={
                  valueComponent
                    ? valueComponent.map((component) => ({
                        ...component,
                        valueKey: "value",
                        hideLabel: true,
                      }))
                    : []
                }
                data={dataItem}
                onChangeData={onChangeData}
                onChangeSchema={(newSchema) => {
                  console.warn(
                    "DataDictionaryInterfaceComponent.render",
                    "TODO: Cannot alter schema inside ComponentRenderer in DataDictionary",
                    { newSchema }
                  )
                }}
              />
            </DataPathContext>
          )
        }}
        valueLabel={
          Array.isArray(valueComponent) && valueComponent.length ? valueComponent[0].label : ""
        }
      />
    )
  }
}
