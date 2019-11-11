import { init } from "@rematch/core"
import { some } from "fp-ts/lib/Option"
import { get, set } from "lodash/fp"
import React from "react"
import { CodeEditor } from "../../../../code-editor"
import { UserInterfaceProps } from "../../../UserInterface"
import { codeEditorManageForm } from "./code-editor-manage-form"
import {
  ComponentDefinitionNamedProps,
  BaseInterfaceComponent,
} from "../../base/BaseInterfaceComponent"

type SupportedEditorLang = "csharp" | "javascript" | "json" | "typescript" | "sql"
type SupportedEditorTheme = "vs" | "vs-dark" | "hc-black"

export interface CodeEditorInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "code-editor"
  defaultLanguage: SupportedEditorLang
  defaultTheme: SupportedEditorTheme
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

interface CodeEditorInterfaceComponentState {
  value: boolean
}

export class CodeEditorInterfaceComponent extends BaseInterfaceComponent<
  CodeEditorInterfaceComponentProps,
  CodeEditorInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "code",
    defaultValue: "",
  }

  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "code-editor",
      title: "Code Editor",
      icon: "code",
      formControl: true,
      componentDefinition: {
        component: "code-editor",
        label: "Code Editor",
      },
    }
  }

  static manageForm = codeEditorManageForm

  handleChange = ({ value: newValue }: { value: string }) => {
    const { defaultValue, onChangeData, userInterfaceData, valueKey } = this.props
    const value = get(valueKey, userInterfaceData) || defaultValue
    if ((newValue || "") !== (value || "")) {
      onChangeData && onChangeData(set(valueKey, value, userInterfaceData))
    }
  }

  render(): JSX.Element {
    const { defaultLanguage, defaultTheme, defaultValue, userInterfaceData, valueKey } = this.props

    const value = get(valueKey, userInterfaceData) || defaultValue

    return (
      <CodeEditor
        content={value}
        contentDraft={some(value)}
        height="400px"
        language={defaultLanguage}
        theme={defaultTheme}
        width="100%"
        onChange={this.handleChange}
      />
    )
  }
}
