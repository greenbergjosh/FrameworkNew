import { LineChartInterfaceComponent } from "../../plugins/nivo/line-chart/LineChartInterfaceComponent"
import { PieInterfaceComponent } from "../../plugins/nivo/pie/PieInterfaceComponent"
import { MapInterfaceComponent } from "../../plugins/nivo/map/MapInterfaceComponent"
import { ThermometerInterfaceComponent } from "../../plugins/nivo/thermometer/ThermometerInterfaceComponent"
import { ComponentRegistryCache } from "../../services/ComponentRegistry"

const plugin: ComponentRegistryCache = {
  "line-chart": LineChartInterfaceComponent,
  pie: PieInterfaceComponent,
  map: MapInterfaceComponent,
  thermometer: ThermometerInterfaceComponent,
}

export default plugin
