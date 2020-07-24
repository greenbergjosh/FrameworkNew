import CKEditor from "ckeditor4-react"
import { get, set } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { richTextEditorManageForm } from "./rich-text-editor-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

CKEditor.editorUrl = "https://cdn.ckeditor.com/4.12.1/full-all/ckeditor.js"

export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "rich-text-editor"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

interface InputInterfaceComponentState {}

export class RichTextEditorInterfaceComponent extends BaseInterfaceComponent<
  InputInterfaceComponentProps
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "rich-text-editor",
      title: "Rich Text Editor",
      icon: "form",
      formControl: true,
      componentDefinition: {
        component: "rich-text-editor",
        label: "Rich Text",
      },
    }
  }

  static manageForm = richTextEditorManageForm

  constructor(props: InputInterfaceComponentProps) {
    super(props)
  }

  handleChange = (evt: CKEDITOR.eventInfo) => {
    const value = evt.editor.getData()
    const { onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData(set(valueKey, value, userInterfaceData))
  }

  render(): JSX.Element {
    const { defaultValue, userInterfaceData, valueKey } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    return (
      <CKEditor
        onChange={this.handleChange}
        data={value}
        // Suppresses Error: 'react Error code: editor-element-conflict. editorName: "editor1"'
        onBeforeLoad={(CKEditor: { disableAutoInline: boolean }) =>
          (CKEditor.disableAutoInline = true)
        }
      />
    )
  }
}
