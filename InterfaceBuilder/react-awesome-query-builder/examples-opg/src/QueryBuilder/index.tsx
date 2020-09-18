import React from "react"
import { BuilderProps, Config, ImmutableTree, JsonTree, JsonLogicTree, Query, Utils } from "react-awesome-query-builder"
// import 'react-awesome-query-builder/lib/css/antd.less';
// import "react-awesome-query-builder/css/styles.scss"
import "react-awesome-query-builder/lib/css/styles.css"
import "react-awesome-query-builder/lib/css/compact_styles.css"
import "antd/dist/antd.css"
import { Tabs } from "antd"
import { config } from "./components/config"
import throttle from "lodash/throttle"
import FormattedTabs from "./components/FormattedTabs"
import ResultsTable from "./components/ResultsTable"
import { DemoQueryBuilderState } from "./types"
import { CustomBuilder } from "./components/CustomBuilder"
// import savedQuery from "./signal-data/savedQuery.json"
import savedQuery from "./signal-data/savedJsonLogicQuery.json"

const { getTree, checkTree, loadTree, uuid, loadFromJsonLogic } = Utils
let throttledTree: ImmutableTree
let throttledConfig: Config

export default function () {
  /* ****************************************
   *
   * STATE
   */

  const { emptyInitValue, initTree } = React.useMemo(() => {
    const emptyInitValue: JsonTree = { id: uuid(), type: "group" }
    const initValue: JsonLogicTree =
      savedQuery && Object.keys(savedQuery).length > 0
        ? (savedQuery as JsonLogicTree)
        : emptyInitValue
    // const initLogic: JsonLogicTree | undefined =
    //   loadedInitLogic && Object.keys(loadedInitLogic).length > 0 ? (loadedInitLogic as JsonLogicTree) : undefined
    // const initTree: ImmutableTree = checkTree(loadTree(initValue), config)
    const initTree = checkTree(loadFromJsonLogic(initValue, config), config); // <- this will work same
    return { emptyInitValue, initTree }
  }, [])

  const [state, setState] = React.useState<DemoQueryBuilderState>({ tree: initTree, config, matchResults: [] })

  /* ****************************************
   *
   * EVENT HANDLERS
   */

  const updateResult = throttle(() => {
    setState({ ...state, tree: throttledTree, config: throttledConfig })
  }, 100)

  const onChange = (immutableTree: ImmutableTree, config: Config) => {
    throttledTree = immutableTree
    throttledConfig = config
    updateResult()

    const jsonTree = getTree(immutableTree)
    // console.log(jsonTree)
    // `jsonTree` can be saved to backend, and later loaded to `queryValue`
  }

  const handleReset = () => {
    setState({
      ...state,
      tree: initTree,
      matchResults: [],
    })
  }

  const handleClear = () => {
    setState({
      ...state,
      tree: loadTree(emptyInitValue),
      matchResults: [],
    })
  }

  /* ****************************************
   *
   * RENDER
   */

  return (
    <>
      <FormattedTabs config={state.config} tree={state.tree}>
        <Tabs.TabPane tab="QueryBuilder" key="0">
          <Query
            {...state.config}
            value={state.tree}
            onChange={onChange}
            renderBuilder={(props: BuilderProps) => (
              <CustomBuilder
                {...props}
                onClear={handleClear}
                onReset={handleReset}
                onGenerateList={(results) => setState({ ...state, matchResults: results })}
              />
            )}
          />
        </Tabs.TabPane>
      </FormattedTabs>
      <ResultsTable
        state={state}
        render={(i) => `${i.Names.toString()}, ${i.Groups.toString()}`}
        render1={(i) => new Date(i).toLocaleDateString()}
        render2={(i) => (i === "Male" ? "M" : "F")}
      />
    </>
  )
}
