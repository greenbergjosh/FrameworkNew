import React from "react"
import { ComponentDefinition, UserInterfaceProps } from "@opg/interface-builder"
import config from "./example-config.json"
import initialData from "./example-data.json"
import { ExampleViewer } from "../../../components/ExampleViewer"
import { cellFormatter } from "./ExampleCellFormatter"
import { columnConfigWithCustomAggregateFunction } from "./ExampleAggregateFunction"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
config.components[1].columns[1].formatter = cellFormatter

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
config.components[1].columns[3] = columnConfigWithCustomAggregateFunction

const TableExample = () => {
  const [data, setData] = React.useState(initialData)
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([config])

  const handleChangeData = React.useCallback((nextData: UserInterfaceProps["data"]) => {
    setData(nextData)
  }, [])

  return (
    <>
      <div style={{ display: "inline-block" }}>
        <button
          style={{ display: "inline-block" }}
          onClick={() =>
            setData({
              reports: {
                end_date: "2021-01-08T04:59:59.999Z",
                start_date: "2021-01-07T05:00:00.000Z",
                "CoregRollup:DemographicsSummary": {
                  r: 0,
                  result: [],
                },
              },
            })
          }>
          Empty Set
        </button>
        <button style={{ display: "inline-block" }} onClick={() => setData(initialData)}>
          Restore
        </button>
      </div>
      <ExampleViewer
        title={"Table with Wrapper"}
        description="Demonstrates the IB Table component wrapped by a local Table component which is registered with InterfaceBuilder. The red border is added by the wrapping component."
        components={schema}
        data={data}
        onChangeData={handleChangeData}
        onChangeData1={(newData: UserInterfaceProps["data"]) => {
          console.log("New Data", newData)
          setData(newData)
        }}
        onChangeSchema={(newSchema: ComponentDefinition[]) => {
          console.log("New Schema", newSchema)
          setSchema(newSchema)
        }}
      />
    </>
  )
}

export default TableExample
