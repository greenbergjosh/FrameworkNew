import React from "react"
import { ComponentDefinition, UserInterfaceProps } from "@opg/interface-builder"
import config from "./example-config.json"
import initialData from "./example-data.json"
import { ExampleViewer } from "../../../components/ExampleViewer"

const TableExample = () => {
  const [data, setData] = React.useState(initialData)
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([config])

  const handleChangeData = React.useCallback((nextData: UserInterfaceProps["data"]) => {
    setData(nextData)
  }, [])

  return (
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
  )
}

export default TableExample
