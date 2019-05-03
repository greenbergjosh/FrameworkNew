import React from "react"
import { Button, Card, Divider, Typography } from "antd"

import { Form, FormBuilder, Components } from "../../../../components/form-io"

import { WithRouteProps } from "../../../../state/navigation"
import CheckMatrix from "./components/CheckMatrix"
import FormCodeEditor from "./components/code-editor/FormCodeEditor"
import FormCodeEditorWrapper from "./components/code-editor/FormCodeEditorWrapper"

Components.setComponents({
  checkmatrix: CheckMatrix,
  "code-editor": FormCodeEditorWrapper,
})

interface Props {}

export function FormEditorTest({ children, ...props }: WithRouteProps<Props>): JSX.Element {
  const [schema, setSchema] = React.useState({ display: "form" })

  return (
    <div>
      <Card>
        Form Editor Test
        <FormBuilder
          form={schema}
          onChange={(newSchema: any) => {
            console.log("New Schema", newSchema)
            setSchema(newSchema)
          }}
        />
        <Divider />
        <Typography.Title>Rendered</Typography.Title>
        <Button onClick={() => setSchema({ ...schema })}>Refresh Render</Button>
        <Form form={schema} onSubmit={(args: any) => console.log("Form Submit", args)} />
        <Typography.Title underline>Schema</Typography.Title>
        <pre>
          {//
          // @ts-ignore
          // console.log("index.FormEditorTest", schema) ||
          JSON.stringify(schema, null, 2)}
        </pre>
        <Typography.Title>View Props</Typography.Title>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </Card>
      {children}
    </div>
  )
}

export default FormEditorTest
