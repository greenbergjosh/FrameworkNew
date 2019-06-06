import { init } from "@rematch/core"
import { some } from "fp-ts/lib/Option"
import React from "react"
import { CodeEditor } from "../../code-editor"
import ReactFormBase from "../ReactFormBase"
import editForm from "./code-editor.form"

type SupportedEditorLang = "csharp" | "javascript" | "json" | "typescript" | "sql"
type SupportedEditorTheme = "vs" | "vs-dark" | "hc-black"

interface EditorOptions {
  lang: SupportedEditorLang
  theme: SupportedEditorTheme
  value: string
}

export default class CodeEditorFormComponent extends ReactFormBase<EditorOptions> {
  static schema(...extend: any[]) {
    return ReactFormBase.schema(
      {
        type: "code-editor",
        label: "Code Editor",
        code: {
          language: "",
          autocompleteOptions: {},
        },
      },
      ...extend
    )
  }

  static builderInfo = {
    title: "Code Editor",
    group: "basic",
    icon: "fa fa-code",
    weight: 10,
    documentation: "http://help.form.io/userguide/#table",
    schema: CodeEditorFormComponent.schema(),
  }

  static editForm = editForm

  constructor(component: any, options: any, data: any) {
    super(component, options, data)

    this.state = {
      lang: component.defaultLanguage,
      theme: component.defaultTheme,
      value: this.emptyValue,
    }
  }

  render(): JSX.Element {
    const { lang, theme, value } = this.state

    return (
      <CodeEditor
        content={value}
        contentDraft={some(value)}
        height="400px"
        language={lang}
        theme={theme}
        width="100%"
        onChange={({ value: newValue }) =>
          (newValue || "") !== (value || "") && this.setState({ value: newValue, lang, theme })
        }
      />
    )
  }

  get emptyValue() {
    return this.component.defaultValue || 'function foo() {\n  console.log("Hello World!")\n}'
  }

  get defaultSchema() {
    return CodeEditorFormComponent.schema()
  }
}
