import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderer,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { slotConfigManageForm } from "./slot-config-manage-form"
import { getSlotConfigLayout } from "./getSlotConfigLayout"

export interface SlotConfigInterfaceComponentProps extends ComponentDefinitionNamedProps {
  actionType: string
  component: "slot-config"
  defaultValue?: string[]
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  providerType: string
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
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

  private handleChangeData = (newData: UserInterfaceProps["data"]) => {
    const value = newData.data.map(({ value }: { value: any }) => value)
    this.setValue([this.props.valueKey, value])
  }

  render(): JSX.Element {
    const { actionType, defaultValue, providerType, getRootUserInterfaceData, onChangeRootData, valueKey } = this.props
    const dataArray = this.getValue(valueKey) || defaultValue || []
    const slotConfigLayout: ComponentDefinition[] = getSlotConfigLayout(
      getRootUserInterfaceData,
      onChangeRootData,
      providerType,
      actionType
    )

    const data = {
      data: dataArray.map((value: any) => ({ value })),
    }

    return (
      <ComponentRenderer
        components={slotConfigLayout}
        data={data}
        getRootUserInterfaceData={getRootUserInterfaceData}
        onChangeRootData={onChangeRootData}
        dragDropDisabled
        onChangeData={this.handleChangeData}
        onChangeSchema={(newSchema) => {
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
