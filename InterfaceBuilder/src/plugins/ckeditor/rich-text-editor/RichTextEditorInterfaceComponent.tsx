import CKEditor from "ckeditor4-react"
import React from "react"
import { richTextEditorManageForm } from "./rich-text-editor-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

CKEditor.editorUrl = "https://cdn.ckeditor.com/4.12.1/full-all/ckeditor.js"

export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "rich-text-editor"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

export class RichTextEditorInterfaceComponent extends BaseInterfaceComponent<InputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition(): LayoutDefinition {
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

  handleChange = (evt: CKEDITOR.eventInfo): void => {
    this.setValue([this.props.valueKey, evt.editor.getData()])
  }

  render(): JSX.Element {
    const rawValue = this.getValue(this.props.valueKey)
    const value = typeof rawValue !== "undefined" ? rawValue : this.props.defaultValue
    return (
      <CKEditor
        onChange={this.handleChange}
        data={value}
        // Suppresses Error: 'react Error code: editor-element-conflict. editorName: "editor1"'
        onBeforeLoad={(CKEditor: { disableAutoInline: boolean }) => (CKEditor.disableAutoInline = true)}
      />
    )
  }
}
