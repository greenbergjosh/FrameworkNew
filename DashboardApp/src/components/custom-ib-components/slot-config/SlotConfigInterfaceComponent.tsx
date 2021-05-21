import { get, set } from "lodash/fp"
import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderer,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { slotConfigManageForm } from "./slot-config-manage-form"

export interface SlotConfigInterfaceComponentProps extends ComponentDefinitionNamedProps {
  actionType: string
  component: "slot-config"
  defaultValue?: string[]
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  providerType: string
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  valueKey: string
}

export class SlotConfigInterfaceComponent extends BaseInterfaceComponent<SlotConfigInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "seqs",
    defaultValue: [],
  }

  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "slot-config",
      title: "Slot Config",
      icon: "border-outer",
      formControl: true,
      componentDefinition: {
        component: "slot-config",
        label: "Slot Config",
      },
    }
  }

  static manageForm = slotConfigManageForm

  render(): JSX.Element {
    const {
      actionType,
      defaultValue,
      onChangeData,
      providerType,
      userInterfaceData,
      getRootUserInterfaceData,
      setRootUserInterfaceData,
      valueKey,
    } = this.props

    const dataArray = get(valueKey, userInterfaceData) || defaultValue || []

    const components: ComponentDefinition[] = [
      {
        key: "slot-config",
        valueKey: "data",
        component: "list",
        orientation: "horizontal",
        interleave: "round-robin",
        getRootUserInterfaceData,
        setRootUserInterfaceData,
        components: [
          {
            key: "provider",
            valueKey: "provider",
            component: "card",
            getRootUserInterfaceData,
            setRootUserInterfaceData,
            components: [
              {
                key: "slot-config-guid",
                valueKey: "value",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: providerType,
                valuePrefix: "@",
                getRootUserInterfaceData,
                setRootUserInterfaceData,
              },
            ],
          },
          {
            key: "slot-config-action",
            valueKey: "value",
            component: "select",
            dataHandlerType: "remote-kvp",
            remoteKeyValuePair: actionType,
            getRootUserInterfaceData,
            setRootUserInterfaceData,
          },
        ],
      },
    ]

    const data = {
      data: dataArray.map((value: any) => ({ value })),
    }

    return (
      <ComponentRenderer
        components={components}
        data={data}
        getRootData={getRootUserInterfaceData}
        setRootData={setRootUserInterfaceData}
        dragDropDisabled
        onChangeData={(newData: any) => {
          onChangeData &&
            onChangeData(
              set(
                valueKey,
                newData.data.map(({ value }: { value: any }) => value),
                userInterfaceData
              )
            )
        }}
        onChangeSchema={(newSchema: any) => {
          console.warn(
            "SlotConfigInterfaceComponent.render",
            "TODO: Cannot alter schema inside ComponentRenderer in SlotConfig",
            { newSchema }
          )
        }}
      />
    )
  }
}
