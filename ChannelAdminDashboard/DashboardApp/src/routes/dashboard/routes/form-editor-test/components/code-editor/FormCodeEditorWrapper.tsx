import React from "react"
import ReactDOM from "react-dom"

import Base from "formiojs/components/base/Base"
import MonacoEditor from "react-monaco-editor"
import editForm from "./code-editor.form"
import { Button, Divider, Dropdown, Icon, Menu, Row, Skeleton } from "antd"
import { activeEditorSettings, CodeEditor } from "../../../../../../components/code-editor"
import { some } from "fp-ts/lib/Option"
import ReactFormBase from "../../../../../../components/form/ReactFormBase"

type SupportedEditorLang = "csharp" | "javascript" | "json" | "typescript" | "sql" | "xml"
type SupportedEditorTheme = "vs" | "vs-dark" | "hc-black"

interface EditorOptions {
  lang: SupportedEditorLang
  theme: SupportedEditorTheme
  value: string
}

export default class FormCodeEditor extends ReactFormBase<EditorOptions> {
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
    schema: FormCodeEditor.schema(),
  }

  static editForm = editForm

  constructor(component: any, options: any, data: any) {
    super(component, options, data)

    this.state = {
      lang: component.defaultLanguage,
      theme: component.defaultTheme,
      value: component.defaultValue,
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
        onChange={(value) => this.setState({ value })}
      />
    )
  }

  get emptyValue() {
    console.log("ReactFormBase.emptyValue")
    return {
      lang: this.component.defaultLanguage || "json",
      theme: this.component.defaultTheme || "vs",
      value: this.component.defaultValue || 'function foo() {\n  console.log("Hello World!")\n}',
    }
  }

  get defaultSchema() {
    return FormCodeEditor.schema()
  }
}
