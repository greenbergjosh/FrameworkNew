import React from "react"
import { mapManageForm } from "./map-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import UsaMap from "./components/UsaMap"
import { MapInterfaceComponentProps, MapInterfaceComponentState, MarkerType } from "./types"
import { get, intersectionWith, isEqual } from "lodash/fp"
import { Empty, Spin } from "antd"

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
    this.state = { loading: true }
  }

  componentDidUpdate(prevProps: Readonly<MapInterfaceComponentProps>) {
    const prevValue: MarkerType[] = get(prevProps.valueKey, prevProps.userInterfaceData) || []
    const nextValue: MarkerType[] = get(this.props.valueKey, this.props.userInterfaceData) || []
    const intersection = intersectionWith(isEqual, prevValue, nextValue)

    if (intersection.length !== prevValue.length || prevValue.length !== nextValue.length) {
      this.setState({ loading: false })
    }
  }

  render(): JSX.Element {
    const { width, mapType, valueKey, userInterfaceData, markerFillColor, markerLimit } = this.props
    const rawMarkers = get(valueKey, userInterfaceData) || []
    const markers = markerLimit && markerLimit > 0 ? rawMarkers.slice(0, markerLimit) : rawMarkers

    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} size="small">
        <div style={{ width }}>
          {mapType === "usaStates" ? (
            <UsaMap markers={markers} markerFillColor={markerFillColor} />
          ) : (
            <Empty description="Map features not selected" />
          )}
        </div>
      </Spin>
    )
  }
}
