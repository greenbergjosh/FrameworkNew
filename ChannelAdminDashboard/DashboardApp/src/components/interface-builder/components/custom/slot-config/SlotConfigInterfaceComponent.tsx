import React from "react"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { slotConfigManageForm } from "./slot-config-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

export interface SlotConfigInterfaceComponentProps extends ComponentDefinitionNamedProps {
  actionType: string
  component: "slot-config"
  defaultValue?: string[]
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  providerType: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

interface SlotConfigInterfaceComponentState {}

export class SlotConfigInterfaceComponent extends BaseInterfaceComponent<
  SlotConfigInterfaceComponentProps,
  SlotConfigInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "seqs",
    defaultValue: [],
  }

  static getLayoutDefinition() {
    return {
      category: "Custom",
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
      valueKey,
    } = this.props

    const dataArray = userInterfaceData[valueKey] || defaultValue || []

    const components: ComponentDefinition[] = [
      {
        key: "slot-config",
        valueKey: "data",
        component: "list",
        interleave: "round-robin",
        components: [
          {
            key: "slot-config-guid",
            valueKey: "value",
            component: "select",
            dataHandlerType: "remote-config",
            remoteConfigType: providerType,
            valuePrefix: "@",
          },
          {
            key: "slot-config-action",
            valueKey: "value",
            component: "select",
            dataHandlerType: "remote-kvp",
            remoteKeyValuePair: actionType,
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
        dragDropDisabled
        onChangeData={(newData) => {
          onChangeData &&
            onChangeData({
              ...userInterfaceData,
              [valueKey]: newData.data.map(({ value }: { value: any }) => value),
            })
        }}
      />
    )
  }
}
