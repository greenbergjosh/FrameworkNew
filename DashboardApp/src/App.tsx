import * as Reach from "@reach/router"
import { getPersistor } from "@rematch/persist"
import React from "react"
import * as ReactRedux from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import styles from "./App.module.scss"
import "./App.scss"
import "@opg/interface-builder/dist/index.css"
import { useRematch } from "./hooks"
import { store } from "./state/store"
import { DragDropContext, registry, ImportFactory } from "@opg/interface-builder"
import { registerMonacoEditorMount } from "@opg/interface-builder-plugins/lib/monaco/code-editor/registerMonacoEditorMount"
import getMonacoEditorConstructionOptions from "./data/getMonacoEditorConstructionOptions"
import { SplashScreen } from "./components/SplashScreen/SplashScreen"
import { ThemeLoader } from "./themes/ThemeLoader"

/*
 * Import InterfaceBuilder Styles
 * TODO: Can't each plugin be responsible for loading its own css? Rollup is outputting css separately with no import.
 */
import "@opg/interface-builder-plugins/lib/ant/color-picker/index.css"
import "@opg/interface-builder-plugins/lib/ant/column/index.css"
import "@opg/interface-builder-plugins/lib/ant/dev-tools/index.css"
import "@opg/interface-builder-plugins/lib/ant/input/index.css"
import "@opg/interface-builder-plugins/lib/ant/menu/index.css"
import "@opg/interface-builder-plugins/lib/ant/ordered-list/index.css"
import "@opg/interface-builder-plugins/lib/ant/text/index.css"
import "@opg/interface-builder-plugins/lib/ant/tree/index.css"
import "@opg/interface-builder-plugins/lib/ant/upload/index.css"
import "@opg/interface-builder-plugins/lib/html/link/index.css"
import "@opg/interface-builder-plugins/lib/html/tab-set/index.css"
import "@opg/interface-builder-plugins/lib/html/tab/index.css"
import "@opg/interface-builder-plugins/lib/syncfusion/table/index.css"

/*
 * Import InterfaceBuilder Plugins
 */
import BulkTextInput from "@opg/interface-builder-plugins/lib/ant/bulk-text-input"
import Button from "@opg/interface-builder-plugins/lib/ant/button"
import Card from "@opg/interface-builder-plugins/lib/ant/card"
import Checkbox from "@opg/interface-builder-plugins/lib/ant/checkbox"
import Collapse from "@opg/interface-builder-plugins/lib/ant/collapse"
// import ColorPicker from  "@opg/interface-builder-plugins/lib/ant/color-picker"
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
import Icon from "@opg/interface-builder-plugins/lib/ant/icon"
import Input from "@opg/interface-builder-plugins/lib/ant/input"
import LinkButton from "@opg/interface-builder-plugins/lib/ant/link-button"
import List from "@opg/interface-builder-plugins/lib/ant/list"
import Menu from "@opg/interface-builder-plugins/lib/ant/menu"
import Modal from "@opg/interface-builder-plugins/lib/ant/modal"
import NumberInput from "@opg/interface-builder-plugins/lib/ant/number-input"
import NumberRange from "@opg/interface-builder-plugins/lib/ant/number-range"
import Password from "@opg/interface-builder-plugins/lib/ant/password"
import Progress from "@opg/interface-builder-plugins/lib/ant/progress"
// import QueryBuilder from  "@opg/interface-builder-plugins/lib/ant/query-builder"
import queryBuilderLayoutDefinition from "@opg/interface-builder-plugins/lib/ant/query-builder/layoutDefinition"
import Radio from "@opg/interface-builder-plugins/lib/ant/radio"
import OrderedList from "@opg/interface-builder-plugins/lib/ant/ordered-list"
import SectionedNavigation from "@opg/interface-builder-plugins/lib/ant/sectioned-navigation"
// import Select from  "@opg/interface-builder-plugins/lib/ant/select"
// import StringTemplate from  "@opg/interface-builder-plugins/lib/ant/string-template"
import Tabs from "@opg/interface-builder-plugins/lib/ant/tabs"
// import Tags from  "@opg/interface-builder-plugins/lib/ant/tags"
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
// import Link from "@opg/interface-builder-plugins/lib/html/link"
import Repeater from "@opg/interface-builder-plugins/lib/html/repeater"
import Tab from "@opg/interface-builder-plugins/lib/html/tab"
import TabSet from "@opg/interface-builder-plugins/lib/html/tab-set"
// import CodeEditor from  "@opg/interface-builder-plugins/lib/monaco/code-editor"
import codeEditorLayoutDefinition from "@opg/interface-builder-plugins/lib/monaco/code-editor/layoutDefinition"
// import LineChart from "@opg/interface-builder-plugins/lib/nivo/line-chart"
import lineChartLayoutDefinition from "@opg/interface-builder-plugins/lib/nivo/line-chart/layoutDefinition"
// import Map from "@opg/interface-builder-plugins/lib/nivo/map"
import mapLayoutDefinition from "@opg/interface-builder-plugins/lib/nivo/map/layoutDefinition"
// import Pie from  "@opg/interface-builder-plugins/lib/nivo/pie"
import pieLayoutDefinition from "@opg/interface-builder-plugins/lib/nivo/pie/layoutDefinition"
// import Thermometer from "@opg/interface-builder-plugins/lib/nivo/thermometer"
import thermometerLayoutDefinition from "@opg/interface-builder-plugins/lib/nivo/thermometer/layoutDefinition"
import Route from "@opg/interface-builder-plugins/lib/reach-router/route"
import Router from "@opg/interface-builder-plugins/lib/reach-router/router"
// import Table from  "@opg/interface-builder-plugins/lib/syncfusion/table"
import tableLayoutDefinition from "@opg/interface-builder-plugins/lib/syncfusion/table/layoutDefinition"

/*
 * Import DashboardApp Plugins
 */
import Query from "./ib-plugins/query"
import Execute from "./ib-plugins/execute"
import Relationships from "./ib-plugins/relationships"
import RemoteComponent from "./ib-plugins/remote-component"
import SlotConfig from "./ib-plugins/slot-config"
import Select from "./ib-plugins/select"
import Tags from "./ib-plugins/tags"
import StringTemplate from "./ib-plugins/string-template"
// import Pie from "./components/custom-ib-components/pie"
import Link from "./ib-plugins/link"

const persistor = getPersistor()

export function App(): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    profile: appState.iam.profile,
    isCheckingSession: appState.loading.effects.iam.attemptResumeSession,
    routes: store.select.navigation.routes(appState),
    appConfig: store.select.apps.appConfig(appState),
    appPaths: appState.apps.appPaths,
  }))

  React.useEffect(() => {
    dispatch.iam.attemptResumeSession()
  }, [dispatch.iam])

  React.useEffect(() => {
    /*
     * Register InterfaceBuilder Components
     */
    registry.register({
      "ordered-list": OrderedList,
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
      icon: Icon,
      input: Input,
      link: Link,
      "link-button": LinkButton,
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
      "line-chart": {
        component: (() =>
          import(
            "@opg/interface-builder-plugins/lib/nivo/line-chart/LineChartInterfaceComponent"
          )) as unknown as ImportFactory,
        layoutDefinition: lineChartLayoutDefinition,
      },
      map: {
        component: (() =>
          import("@opg/interface-builder-plugins/lib/nivo/map/MapInterfaceComponent")) as unknown as ImportFactory,
        layoutDefinition: mapLayoutDefinition,
      },
      // pie: Pie,
      thermometer: {
        component: (() =>
          import(
            "@opg/interface-builder-plugins/lib/nivo/thermometer/ThermometerInterfaceComponent"
          )) as unknown as ImportFactory,
        layoutDefinition: thermometerLayoutDefinition,
      },
      route: Route,
      router: Router,
      // table: (() =>
      //   import(
      //     "@opg/interface-builder-plugins/lib/syncfusion/table/TableInterfaceComponent"
      //   )) as unknown as ImportFactory,
    })

    /*
     * Register DashboardApp components
     */
    registry.register({
      query: Query,
      execute: Execute,
      relationships: Relationships,
      "remote-component": RemoteComponent,
      "slot-config": SlotConfig,
      "string-template": StringTemplate,
      select: Select,
      table: {
        component: (() => import("./ib-plugins/table/TableInterfaceComponent")) as unknown as ImportFactory,
        layoutDefinition: tableLayoutDefinition,
      },
      tags: Tags,
      pie: {
        component: (() => import("./ib-plugins/pie/PieInterfaceComponent")) as unknown as ImportFactory,
        layoutDefinition: pieLayoutDefinition,
      },
      link: Link,
    })

    registerMonacoEditorMount(getMonacoEditorConstructionOptions)
  }, [])

  return (
    <PersistGate persistor={persistor} loading={<SplashScreen title="Restoring Application State..." />}>
      <div className={`${styles.app}`}>
        <ReactRedux.Provider store={store}>
          <DragDropContext.HTML5>
            {fromStore.isCheckingSession && fromStore.profile.isNone() ? (
              <SplashScreen title="Checking Session Authentication..." />
            ) : (
              <Reach.Router>
                <ThemeLoader path={`/*`} />
              </Reach.Router>
            )}
          </DragDropContext.HTML5>
        </ReactRedux.Provider>
      </div>
    </PersistGate>
  )
}
