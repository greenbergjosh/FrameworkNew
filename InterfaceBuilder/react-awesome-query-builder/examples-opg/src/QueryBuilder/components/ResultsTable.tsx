import { DemoQueryBuilderState } from "../types"
import { Table } from "antd"
import React from "react"

/**
 * Usage:
 <ResultsTable
  state={state}
  render={(i) => `${i.Names.toString()}, ${i.Groups.toString()}`}
  render1={(i) => new Date(i).toLocaleDateString()}
  render2={(i) => (i === "Male" ? "M" : "F")}
 />
 * @param props
 * @constructor
 */
export default function ResultsTable(props: {
  state: DemoQueryBuilderState
  render: (i: any) => string
  render1: (i: any) => string
  render2: (i: any) => string
}) {
  return (
    <Table
      dataSource={props.state.matchResults}
      rowKey="id"
      columns={[
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
        },
        {
          title: "Domains",
          dataIndex: "Domains",
          key: "Domains",
          render: props.render,
        },
        {
          title: "Date of Birth",
          dataIndex: "DateOfBirth",
          key: "DateOfBirth",
          render: props.render1,
        },
        {
          title: "Gender",
          dataIndex: "Gender",
          key: "Gender",
          render: props.render2,
        },
        {
          title: "Attributors",
          dataIndex: "Signal.Attributors",
          key: "Attributors",
        },
        {
          title: "Record Types",
          dataIndex: "Signal.RecordTypes",
          key: "RecordTypes",
        },
        {
          title: "Seen",
          dataIndex: "Signal.Seen.Days",
          key: "Days",
        },
      ]}
    />
  )
}
