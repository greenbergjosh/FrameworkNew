import {Config, ImmutableTree, Utils} from "react-awesome-query-builder"
import {Tabs} from "antd"
import {CopyToClipboard} from "react-copy-to-clipboard"
import React from "react"
import "react-awesome-query-builder/css/styles.scss"
import "react-awesome-query-builder/lib/css/styles.css"
import "react-awesome-query-builder/lib/css/compact_styles.css"
import "antd/dist/antd.css"

const {
  queryBuilderFormat,
  jsonLogicFormat,
  queryString,
  getTree,
  checkTree,
  loadTree,
  uuid,
  loadFromJsonLogic,
} = Utils

const preStyle = {
  backgroundColor: "#E0E0E0",
  margin: "10px",
  padding: "10px",
  borderRadius: 5,
  overflow: "scroll",
}
const preErrorStyle = {
  backgroundColor: "lightpink",
  margin: "10px",
  padding: "10px",
  borderRadius: 5,
}

export default function FormattedTabs({
  tree: immutableTree,
  config,
  children,
}: {
  tree: ImmutableTree
  config: Config
  children: JSX.Element
}) {
  const { logic, data, errors } = jsonLogicFormat(immutableTree, config)

  return (
    <Tabs defaultActiveKey="0" type="card">
      {children}
      <Tabs.TabPane tab="jsonLogic" key="1">
        <CopyToClipboard text={JSON.stringify(logic, undefined, 2)} style={{ color: "#1890ff", cursor: "pointer" }}>
          <span>Copy Rule</span>
        </CopyToClipboard>
        <span style={{ marginLeft: 20, marginRight: 20, color: "#E0E0E0" }}>|</span>
        <CopyToClipboard text={JSON.stringify(data, undefined, 2)} style={{ color: "#1890ff", cursor: "pointer" }}>
          <span>Copy Data</span>
        </CopyToClipboard>
        <span style={{ marginLeft: 20, marginRight: 20, color: "#E0E0E0" }}>|</span>
        <a href="http://jsonlogic.com" target="_blank" rel="noopener noreferrer">
          About jsonLogicFormat
        </a>
        <span style={{ marginLeft: 20, marginRight: 20, color: "#E0E0E0" }}>|</span>
        <a href="https://www.nuget.org/packages/JsonLogic.Net/" target="_blank" rel="noopener noreferrer">
          JsonLogic.Net
        </a>
        {errors!.length > 0 && <pre style={preErrorStyle}>{JSON.stringify(errors, undefined, 2)}</pre>}
        {!!logic && (
          <>
            <h2 style={{ marginTop: 20 }}>Rule</h2>
            <pre style={preStyle}>{JSON.stringify(logic, undefined, 2)}</pre>
            <h2>Data</h2>
            <pre style={preStyle}>{JSON.stringify(data, undefined, 2)}</pre>
          </>
        )}
      </Tabs.TabPane>
      <Tabs.TabPane tab="Tree" key="6">
        <CopyToClipboard
          text={JSON.stringify(getTree(immutableTree), undefined, 2)}
          style={{ color: "#1890ff", cursor: "pointer" }}>
          <span>Copy to clipboard</span>
        </CopyToClipboard>
        <pre style={preStyle}>{JSON.stringify(getTree(immutableTree), undefined, 2)}</pre>
      </Tabs.TabPane>
    </Tabs>
  )
}
