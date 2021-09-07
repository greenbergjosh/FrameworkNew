import React from "react"
import { Layout } from "antd"
import "antd/dist/antd.css"
import { registry, DragDropContext, ImportFactory } from "@opg/interface-builder"
import "./App.css"
import "@opg/interface-builder/dist/index.css"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { ExamplesView } from "./views/examples/ExamplesView"
import { HomeView } from "./views/HomeView"
import { QuickStartView } from "./views/QuickStartView"
import { DocsView } from "./views/DocsView"
import { MainMenu } from "./views/MainMenu"

/*
 * IMPORT PLUGINS
 */
import BulkTextInput from "@opg/interface-builder-plugins/lib/ant/bulk-text-input"
import Button from "@opg/interface-builder-plugins/lib/ant/button"
import Card from "@opg/interface-builder-plugins/lib/ant/card"
import Checkbox from "@opg/interface-builder-plugins/lib/ant/checkbox"
import Collapse from "@opg/interface-builder-plugins/lib/ant/collapse"
// import ColorPicker from "@opg/interface-builder-plugins/lib/ant/color-picker"
import colorPickerLayoutDefinition from "@opg/interface-builder-plugins/lib/ant/color-picker/layoutDefinition"
import Column from "@opg/interface-builder-plugins/lib/ant/column"
import DataDictionary from "@opg/interface-builder-plugins/lib/ant/data-dictionary"
import DataMap from "@opg/interface-builder-plugins/lib/ant/data-map"
import Date from "@opg/interface-builder-plugins/lib/ant/date"
import DateRange from "@opg/interface-builder-plugins/lib/ant/date-range"
import DateStepper from "@opg/interface-builder-plugins/lib/ant/date-stepper"
import DevTools from "@opg/interface-builder-plugins/lib/ant/dev-tools"
import Divider from "@opg/interface-builder-plugins/lib/ant/divider"
import Download from "@opg/interface-builder-plugins/lib/ant/download"
import Empty from "@opg/interface-builder-plugins/lib/ant/empty"
import Form from "@opg/interface-builder-plugins/lib/ant/form"
import Input from "@opg/interface-builder-plugins/lib/ant/input"
import Link from "@opg/interface-builder-plugins/lib/ant/link"
import List from "@opg/interface-builder-plugins/lib/ant/list"
import Menu from "@opg/interface-builder-plugins/lib/ant/menu"
import Modal from "@opg/interface-builder-plugins/lib/ant/modal"
import NumberInput from "@opg/interface-builder-plugins/lib/ant/number-input"
import NumberRange from "@opg/interface-builder-plugins/lib/ant/number-range"
import Password from "@opg/interface-builder-plugins/lib/ant/password"
import Progress from "@opg/interface-builder-plugins/lib/ant/progress"
// import QueryBuilder from "@opg/interface-builder-plugins/lib/ant/query-builder"
import queryBuilderLayoutDefinition from "@opg/interface-builder-plugins/lib/ant/query-builder/layoutDefinition"
import Radio from "@opg/interface-builder-plugins/lib/ant/radio"
import Repeater from "@opg/interface-builder-plugins/lib/ant/repeater"
import SectionedNavigation from "@opg/interface-builder-plugins/lib/ant/sectioned-navigation"
import Select from "@opg/interface-builder-plugins/lib/ant/select"
import StringTemplate from "@opg/interface-builder-plugins/lib/ant/string-template"
import Tabs from "@opg/interface-builder-plugins/lib/ant/tabs"
import Tags from "@opg/interface-builder-plugins/lib/ant/tags"
import Text from "@opg/interface-builder-plugins/lib/ant/text"
import TextArea from "@opg/interface-builder-plugins/lib/ant/textarea"
import TimeRange from "@opg/interface-builder-plugins/lib/ant/time-range"
import Toggle from "@opg/interface-builder-plugins/lib/ant/toggle"
import Tree from "@opg/interface-builder-plugins/lib/ant/tree"
import Upload from "@opg/interface-builder-plugins/lib/ant/upload"
import UserInterface from "@opg/interface-builder-plugins/lib/ant/user-interface"
import Wizard from "@opg/interface-builder-plugins/lib/ant/wizard"
import Container from "@opg/interface-builder-plugins/lib/html/container"
import DataInjector from "@opg/interface-builder-plugins/lib/html/data-injector"
import IFrame from "@opg/interface-builder-plugins/lib/html/iframe"
import Tab from "@opg/interface-builder-plugins/lib/html/tab"
import TabSet from "@opg/interface-builder-plugins/lib/html/tab-set"
// import CodeEditor from "@opg/interface-builder-plugins/lib/monaco/code-editor"
import codeEditorLayoutDefinition from "@opg/interface-builder-plugins/lib/monaco/code-editor/layoutDefinition"
import LineChart from "@opg/interface-builder-plugins/lib/nivo/line-chart"
import Map from "@opg/interface-builder-plugins/lib/nivo/map"
import Pie from "@opg/interface-builder-plugins/lib/nivo/pie"
import Thermometer from "@opg/interface-builder-plugins/lib/nivo/thermometer"
import IBRoute from "@opg/interface-builder-plugins/lib/reach-router/route"
import IBRouter from "@opg/interface-builder-plugins/lib/reach-router/router"
// import Table from "@opg/interface-builder-plugins/lib/syncfusion/table"
import tableLayoutDefinition from "@opg/interface-builder-plugins/lib/syncfusion/table/layoutDefinition"

/*
 * REGISTER PLUGINS
 */
registry.register({
  "bulk-text-input": BulkTextInput,
  button: Button,
  card: Card,
  checkbox: Checkbox,
  collapse: Collapse,
  "color-picker": {
    component: (() =>
      import(
        "@opg/interface-builder-plugins/lib/ant/color-picker/ColorPickerInterfaceComponent"
      )) as unknown as ImportFactory,
    layoutDefinition: colorPickerLayoutDefinition,
  },
  column: Column,
  "data-dictionary": DataDictionary,
  "data-map": DataMap,
  date: Date,
  "date-range": DateRange,
  "date-stepper": DateStepper,
  "dev-tools": DevTools,
  divider: Divider,
  download: Download,
  empty: Empty,
  form: Form,
  input: Input,
  link: Link,
  list: List,
  menu: Menu,
  modal: Modal,
  "number-input": NumberInput,
  "number-range": NumberRange,
  password: Password,
  progress: Progress,
  "query-builder": {
    component: (() =>
      import(
        "@opg/interface-builder-plugins/lib/ant/query-builder/QueryBuilderInterfaceComponent"
      )) as unknown as ImportFactory,
    layoutDefinition: queryBuilderLayoutDefinition,
  },
  radio: Radio,
  repeater: Repeater,
  "sectioned-navigation": SectionedNavigation,
  select: Select,
  "string-template": StringTemplate,
  tabs: Tabs,
  tags: Tags,
  text: Text,
  textarea: TextArea,
  "time-range": TimeRange,
  toggle: Toggle,
  tree: Tree,
  upload: Upload,
  "user-interface": UserInterface,
  wizard: Wizard,
  container: Container,
  "data-injector": DataInjector,
  iframe: IFrame,
  tab: Tab,
  "tab-set": TabSet,
  "code-editor": {
    component: (() =>
      import(
        "@opg/interface-builder-plugins/lib/monaco/code-editor/CodeEditorInterfaceComponent"
      )) as unknown as ImportFactory,
    layoutDefinition: codeEditorLayoutDefinition,
  },
  "line-chart": LineChart,
  map: Map,
  pie: Pie,
  thermometer: Thermometer,
  route: IBRoute,
  router: IBRouter,
  table: {
    component: (() =>
      import(
        "@opg/interface-builder-plugins/lib/syncfusion/table/TableInterfaceComponent"
      )) as unknown as ImportFactory,
    layoutDefinition: tableLayoutDefinition,
  },
})

/* IB Overrides */
// registry.register({ table: TableInterfaceComponent })

const App: React.FC = () => {
  return (
    <DragDropContext.HTML5>
      <Router>
        <Layout className="App">
          <Layout.Header className="header">
            <MainMenu />
          </Layout.Header>
          <Switch>
            <Route exact path="/">
              <HomeView />
            </Route>
            <Route path="/examples">
              <ExamplesView />
            </Route>
            <Route path="/quick-start">
              <QuickStartView />
            </Route>
            <Route path="/docs">
              <DocsView />
            </Route>
          </Switch>
        </Layout>
      </Router>
    </DragDropContext.HTML5>
  )
}

export default App
