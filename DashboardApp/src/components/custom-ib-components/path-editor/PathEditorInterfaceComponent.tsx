import React from "react"
import { pathEditorManageForm } from "./path-editor-manage-form"
import { BaseInterfaceComponent, CodeEditor, CodeEditorProps } from "@opg/interface-builder"
import { PathEditorInterfaceComponentProps, PathEditorInterfaceComponentState } from "./types"
import { some } from "fp-ts/lib/Option"
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api"
import { pathExtraLib } from "./pathExtraLib"

export class PathEditorInterfaceComponent extends BaseInterfaceComponent<
  PathEditorInterfaceComponentProps,
  PathEditorInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "code",
    defaultValue: "",
  }

  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "path-editor",
      title: "Path Editor",
      icon: "code",
      formControl: true,
      componentDefinition: {
        component: "path-editor",
        label: "Path Editor",
      },
    }
  }

  static manageForm = pathEditorManageForm

  /****************************************************************************
   * EVENT HANDLERS
   */

  /**
   * Put editor value into model
   * @param newValue
   */
  handleChange: CodeEditorProps["onChange"] = ({ value, errors }): void => {
    console.error("CodeEditorInterfaceComponent.handleChange", errors)
    const prevValue = this.getValue(this.props.valueKey) || this.props.defaultValue

    if ((value || "") !== (prevValue || "")) {
      this.setValue([this.props.valueKey, value])
    }
  }

  handleEditorDidMount(getEditorValue: () => string, editor: monacoEditor.editor.IStandaloneCodeEditor) {
    /*
     * Add blur and focus event handlers so that when the editor is blurred,
     * we restore normal Typescript behavior in case there is another
     * Monaco editor active that is using Typescript. This situation
     * exists because we are changing the typescriptDefaults in order
     * to show the Path intellisense and remove browser DOM intellisense.
     */
    editor.onDidBlurEditorWidget(() => {
      toggleTypescriptDefaults(false)
    })
    editor.onDidFocusEditorWidget(() => {
      toggleTypescriptDefaults(true)
    })
  }

  render(): JSX.Element {
    const value = this.getValue(this.props.valueKey) || this.props.defaultValue

    return (
      <CodeEditor
        document={value}
        documentDraft={some(value)}
        height="400px"
        language="typescript"
        theme={this.props.defaultTheme}
        width="100%"
        outputType="string"
        onChange={this.handleChange}
        editorDidMount={this.handleEditorDidMount}
      />
    )
  }
}

/****************************************************************************
 * PRIVATE FUNCTIONS
 */

function toggleTypescriptDefaults(isPathEnabled: boolean) {
  // monacoEditor.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  //   noSemanticValidation: !isPathEnabled, // TS: false, Path: false
  //   noSyntaxValidation: !isPathEnabled, // TS: false, Path: false
  // })
  monacoEditor.languages.typescript.typescriptDefaults.setCompilerOptions({
    // target: languages.typescript.ScriptTarget.ES2015,
    allowNonTsExtensions: true, // TS: true, Path: true
    noLib: isPathEnabled, // TS: no property, Path: true
  })
  const extraLibs = isPathEnabled ? [pathExtraLib] : []
  monacoEditor.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs)
}
