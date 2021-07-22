import React from "react"
import { ComponentDefinition, UserInterfaceProps } from "@opg/interface-builder"
import config from "./example-config.json"
import initialData from "./example-data.json"
import { ExampleView } from "../../ExampleView"

const defaultSchema = {
  ...config,
  getRootUserInterfaceData: () => void 0,
  onChangeRootData: () => void 0,
}

const Example: React.FC = () => {
  const [data, setData] = React.useState(initialData)
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([defaultSchema])

  const handleChangeData = React.useCallback((nextData: UserInterfaceProps["data"]) => {
    setData(nextData)
  }, [])

  return (
    <ExampleView
      title={"Events"}
      description="Description of Events goes here."
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
      getRootUserInterfaceData={() => data}
      onChangeRootData={(data) => setData(data)}
    />
  )
}

export default Example
