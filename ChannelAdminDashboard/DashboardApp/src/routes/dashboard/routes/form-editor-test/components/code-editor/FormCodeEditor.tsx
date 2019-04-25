import React from "react"
import ReactDOM from "react-dom"

import Base from "formiojs/components/base/Base"
import MonacoEditor from "react-monaco-editor"
import editForm from "./code-editor.form"
import { Button, Divider, Dropdown, Icon, Menu, Row, Skeleton } from "antd"
import { activeEditorSettings, CodeEditor } from "../../../../../../components/code-editor"
import { some } from "fp-ts/lib/Option"

type SupportedEditorLang = "csharp" | "javascript" | "json" | "typescript" | "sql"
type SupportedEditorTheme = "vs" | "vs-dark" | "hc-black"

interface EditorOptions {
  editorLang: SupportedEditorLang
  editorTheme: SupportedEditorTheme
  editorValue: string
}

export default class FormCodeEditor extends Base implements EditorOptions {
  editorLang: SupportedEditorLang
  editorTheme: SupportedEditorTheme
  editorValue: string

  static schema(...extend: any[]) {
    return Base.schema(
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
    // console.log("FormCodeEditor.constructor", { component, options, data })

    this.editorLang = component.defaultLanguage
    this.editorTheme = component.defaultTheme
    this.editorValue = component.defaultValue
  }

  build() {
    this.element = this.ce("div")
    this.createLabel(this.element)

    const controlContainer = this.ce("div", { class: "large-container" })
    this.element.appendChild(controlContainer)

    // console.log("FormCodeEditor.build", this, this.component)

    const generateAndRenderComponent = () => {
      const renderedComponent = (
        <div>
          {/*<EditorSettingsControls*/}
          {/*  disabled={this.options.preview}*/}
          {/*  editorLang={this.editorLang || ""}*/}
          {/*  showLangSelect={this.component.showLangSelect}*/}
          {/*  editorTheme={this.editorTheme || ""}*/}
          {/*  showThemeSelect={this.component.showThemeSelect}*/}
          {/*  setEditorLang={(lang) => {*/}
          {/*    this.editorLang = lang*/}
          {/*    generateAndRenderComponent()*/}
          {/*  }}*/}
          {/*  setEditorTheme={(theme) => {*/}
          {/*    this.editorTheme = theme*/}
          {/*    generateAndRenderComponent()*/}
          {/*  }}*/}
          {/*/>*/}
          <Divider />
          <CodeEditor
            content={this.editorValue}
            contentDraft={some(this.editorValue)}
            height="400px"
            language={this.editorLang}
            width="`00%"
          />
          {/*<MonacoEditor*/}
          {/*  options={activeEditorSettings}*/}
          {/*  height="400px"*/}
          {/*  language={this.editorLang}*/}
          {/*  onChange={(value) => {*/}
          {/*    this.editorValue = value*/}
          {/*  }}*/}
          {/*  theme={this.editorTheme}*/}
          {/*  defaultValue={this.editorValue}*/}
          {/*  width="100%"*/}
          {/*/>*/}
        </div>
      )

      ReactDOM.render(renderedComponent, controlContainer)
    }

    setTimeout(generateAndRenderComponent, 100)
  }

  elementInfo() {
    const info = super.elementInfo()
    // console.log("FormCodeEditor.elementInfo", info)
    info.changeEvent = "input"
    return info
  }

  get emptyValue() {
    // console.log("FormCodeEditor.emptyValue", this)
    return {
      editorLang: this.component.defaultLanguage || "json",
      editorTheme: this.component.defaultTheme || "vs",
      editorValue:
        this.component.defaultValue || 'function foo() {\n  console.log("Hello World!")\n}',
    }
  }

  getValue() {
    return {
      editorLang: this.editorLang,
      editorTheme: this.editorTheme,
      editorValue: this.editorValue,
    }
  }

  setValue(value: EditorOptions) {
    this.editorLang = value.editorLang
    this.editorTheme = value.editorTheme
    this.editorValue = value.editorValue
  }

  get defaultSchema() {
    return FormCodeEditor.schema()
  }
}

function EditorSettingsControls(props: {
  disabled: boolean
  editorLang: SupportedEditorLang
  editorTheme: SupportedEditorTheme
  setEditorLang: (lang: SupportedEditorLang) => void
  setEditorTheme: (theme: SupportedEditorTheme) => void
  showLangSelect?: boolean
  showThemeSelect?: boolean
}) {
  return (
    <>
      {props.showLangSelect && (
        <Dropdown
          disabled={props.disabled}
          placement="bottomCenter"
          trigger={["click"]}
          overlay={
            <Menu
              defaultOpenKeys={[props.editorLang]}
              selectedKeys={[props.editorLang]}
              onClick={({ key }) => {
                props.setEditorLang(key as SupportedEditorLang)
              }}>
              <Menu.Item key="csharp">C#</Menu.Item>
              <Menu.Item key="javascript">JavaScript</Menu.Item>
              <Menu.Item key="json">JSON</Menu.Item>
              <Menu.Item key="typescript">TypeScript</Menu.Item>
              <Menu.Item key="sql">SQL</Menu.Item>
            </Menu>
          }>
          <Button size="small" style={{ marginLeft: 8 }}>
            {`Language: ${props.editorLang}`} <Icon type="down" />
          </Button>
        </Dropdown>
      )}
      {props.showThemeSelect && (
        <Dropdown
          disabled={props.disabled}
          placement="bottomCenter"
          trigger={["click"]}
          overlay={
            <Menu
              defaultOpenKeys={[props.editorTheme]}
              selectedKeys={[props.editorTheme]}
              onClick={({ key }) => {
                props.setEditorTheme(key as SupportedEditorTheme)
              }}>
              <Menu.Item key="vs">VS (default)</Menu.Item>
              <Menu.Item key="vs-dark">Dark Mode</Menu.Item>
              <Menu.Item key="hc-black">High Contrast Dark</Menu.Item>
            </Menu>
          }>
          <Button size="small" style={{ marginLeft: 8 }}>
            {`Theme: ${props.editorTheme}`} <Icon type="down" />
          </Button>
        </Dropdown>
      )}
    </>
  )
}

EditorSettingsControls.defaultProps = {
  showLangSelect: true,
  showThemeSelect: true,
}
