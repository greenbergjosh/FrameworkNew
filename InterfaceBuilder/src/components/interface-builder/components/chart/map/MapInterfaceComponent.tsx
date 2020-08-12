import React from "react"
import { mapManageForm } from "./map-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import UsaMap from "./components/UsaMap"
import { MapInterfaceComponentProps, MapInterfaceComponentState } from "./types"
import { get } from "lodash/fp"

export class MapInterfaceComponent extends BaseInterfaceComponent<
  MapInterfaceComponentProps,
  MapInterfaceComponentState
> {
  static getLayoutDefinition() {
    return {
      category: "Chart",
      name: "map",
      title: "Geo Map",
      icon: "global",
      componentDefinition: {
        component: "map",
        label: "Geo Map",
      },
    }
  }

  static manageForm = mapManageForm

  constructor(props: MapInterfaceComponentProps) {
    super(props)
  }

  render(): JSX.Element {
    const { userInterfaceData, valueKey, width } = this.props
    const value = get(valueKey, userInterfaceData)

    return (
      <div style={{ width }}>
        <UsaMap markers={value} />
      </div>
    )
  }
}
