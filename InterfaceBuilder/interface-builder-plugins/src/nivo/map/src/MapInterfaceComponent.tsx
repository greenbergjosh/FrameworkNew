import React from "react"
import UsaMap from "./components/UsaMap"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { Empty, Icon, Spin } from "antd"
import { intersectionWith, isEqual } from "lodash/fp"
import { MapInterfaceComponentProps, MapInterfaceComponentState, MarkerType } from "./types"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"

export default class MapInterfaceComponent extends BaseInterfaceComponent<
  MapInterfaceComponentProps,
  MapInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

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
