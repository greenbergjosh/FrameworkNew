import React from "react"
import config from "./config.json"
import {
  /* This first section are .ts files and will NOT crash the app */

  // cheapHash,
  // ComponentDefinition,
  // ComponentDefinitionNamedProps,
  // ComponentRenderMetaProps,
  // DataPathContext,
  // deepDiff,
  // evalExpression,
  // FormInterfaceComponentProps,
  // JSONRecord,
  // Right,
  // sanitizeText,
  // TSEnum,
  // UserInterfaceContextManager,
  // UserInterfaceProps,

  /* Below involve .tsx files and most will crash the app */

  antComponents,
  // BaseInterfaceComponent
  // baseManageForm,
  // CodeEditor,
  // ComponentRenderer,
  // getDefaultsFromComponentDefinitions,
  // registerMonacoEditorMount,
  registry,
  UserInterface,
  // UserInterfaceContext,
  // EditorLangCodec,
  // shallowPropCheck,
  // ConfirmableDeleteButton,
} from "interface-builder"

registry.register(antComponents)

const App: React.FC = () => {
  const [data, setData] = React.useState({})
  const [schema, /*setSchema*/] = React.useState([config])

  return (
    <div>
      <UserInterface
        mode="display"
        components={schema}
        data={data}
        onChangeData={(newData) => {
          console.log("New Data", newData)
          setData(newData)
        }}
      />
    </div>
  )
}

export default App
