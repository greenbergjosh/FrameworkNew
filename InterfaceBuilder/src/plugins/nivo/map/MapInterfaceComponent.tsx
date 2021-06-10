import React from "react"
import { mapManageForm } from "./map-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import UsaMap from "./components/UsaMap"
import { MapInterfaceComponentProps, MapInterfaceComponentState, MarkerType } from "./types"
import { intersectionWith, isEqual } from "lodash/fp"
import { Empty, Icon, Spin } from "antd"
import { LayoutDefinition } from "../../../globalTypes"

export class MapInterfaceComponent extends BaseInterfaceComponent<
  MapInterfaceComponentProps,
  MapInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
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
    const prevValue: MarkerType[] =
      this.getValue(prevProps.valueKey, prevProps.userInterfaceData, prevProps.getRootUserInterfaceData) || []
    const nextValue: MarkerType[] = this.getValue(this.props.valueKey) || []
    const intersection = intersectionWith(isEqual, prevValue, nextValue)

    if (intersection.length !== prevValue.length || prevValue.length !== nextValue.length) {
      this.setState({ loading: false })
    }
  }

  render(): JSX.Element {
    const { width, mapType, valueKey, markerFillColor, markerLimit } = this.props
    const rawMarkers = this.getValue(valueKey) || []
    const markers = markerLimit && markerLimit > 0 ? rawMarkers.slice(0, markerLimit) : rawMarkers

    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} indicator={<Icon type="loading" />}>
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
