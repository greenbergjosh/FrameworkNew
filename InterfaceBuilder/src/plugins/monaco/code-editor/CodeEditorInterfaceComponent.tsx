import { some } from "fp-ts/lib/Option"
import { get, set } from "lodash/fp"
import React from "react"
import { CodeEditor, EditorLang, EditorTheme } from "./code-editor"
import { codeEditorManageForm } from "./code-editor-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

export interface CodeEditorInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "code-editor"
  defaultLanguage: EditorLang
  defaultTheme: EditorTheme
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

  static getLayoutDefinition(): LayoutDefinition {
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

  handleChange = ({ value: newValue }: { value: string }): void => {
    const { defaultValue, onChangeData, userInterfaceData, valueKey } = this.props
    const value = get(valueKey, userInterfaceData) || defaultValue
    if ((newValue || "") !== (value || "")) {
      onChangeData && onChangeData(set(valueKey, newValue, userInterfaceData))
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
