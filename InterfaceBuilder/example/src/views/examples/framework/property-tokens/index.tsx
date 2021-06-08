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
      title={"Tokens in component properties"}
      description={
        <span>
          Component prop values can be tokens that select data from the model. Tokens can be:
          <ul style={{ fontSize: 10, lineHeight: 1.1 }}>
            <li>&#123;$&#125;</li>
            <li>&#123;$:XNN&#125;</li>
            <li>&#123;dataType($)&#125;</li>
            <li>&#123;dataType($):XNN&#125;</li>
            <li>&#123;$.propertyName&#125;</li>
            <li>&#123;$.propertyName.subPropertyName&#125;</li>
            <li>&#123;$.propertyName:XNN&#125;</li>
            <li>&#123;dataType($.propertyName)&#125;</li>
            <li>&#123;dataType($.propertyName):XNN&#125;</li>
          </ul>
        </span>
      }
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
