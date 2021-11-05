import React from "react"
import { DataMap } from "./DataMap"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderer,
  DataPathContext,
  LayoutDefinition,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"

export interface DataDictionaryInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "data-dictionary"
  defaultValue: UserInterfaceProps["data"]
  keyLabel?: string
  valueLabel?: string
  valueComponent: [ComponentDefinition]
  valueKey: string
}

interface DataDictionaryInterfaceComponentState {}

export default class DataDictionaryInterfaceComponent extends BaseInterfaceComponent<
  DataDictionaryInterfaceComponentProps,
  DataDictionaryInterfaceComponentState
> {
  static defaultProps = {
    keyLabel: "Key",
    valueLabel: "Value",
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

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  render(): JSX.Element {
    const { defaultValue, keyLabel, valueLabel, getRootUserInterfaceData, onChangeRootData, valueComponent, valueKey } = this.props
    const dictionary = this.getValue(valueKey) || defaultValue
    const values = dictionary && Object.entries(dictionary).map(([key, value]) => ({ key, value }))
    return (
      <DataMap
        data={values}
        keyLabel={keyLabel}
        valueLabel={valueLabel}
        multiple
        onDataChanged={(newData) => {
          const newValue = newData.reduce((acc, item: any) => {
            acc[item.key] = typeof item.value === "undefined" ? null : item.value
            return acc
          }, {} as any)

          this.setValue([valueKey, newValue])
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
                    getRootUserInterfaceData,
                    onChangeRootData,
                    incomingEventHandlers: this.props.incomingEventHandlers,
                    outgoingEventMap: this.props.outgoingEventMap,
                  },
                ]}
                data={dataItem}
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
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
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
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
      />
    )
  }
}
