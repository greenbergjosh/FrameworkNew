import { some } from "fp-ts/lib/Option"
import React from "react"
import { isEqual } from "lodash/fp"
import { CodeEditor } from "./CodeEditor"
import { codeEditorManageForm } from "./code-editor-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { LayoutDefinition, UserInterfaceDataType } from "../../../globalTypes"
import {
  CodeEditorInterfaceComponentProps,
  CodeEditorInterfaceComponentState,
} from "plugins/monaco/code-editor/types.js"
import { CodeEditorProps } from "./types"

export class CodeEditorInterfaceComponent extends BaseInterfaceComponent<
  CodeEditorInterfaceComponentProps,
  CodeEditorInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "code",
    defaultValue: "",
    autoSync: true,
    defaultLanguage: "json",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
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

  constructor(props: CodeEditorInterfaceComponentProps) {
    super(props)

    this.state = {
      document: null,
    }
  }

  /**
   * Public method for external clients to trigger a load
   *
   * @public
   */
  public load(): void {
    console.log("CodeEditorInterfaceComponent", "load")
    const prevDocument = this.state.document
    const nextDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue

    /*
     * If the external model is ahead of local state,
     * put the external model into local state
     */
    if (!isEqual(prevDocument, nextDocument)) {
      this.setState({ document: nextDocument })
    }
  }

  /**
   * Public method for external clients to trigger a save
   *
   * @public
   */
  public save(): void {
    console.log("CodeEditorInterfaceComponent", "save")
    const prevDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue
    const nextDocument = this.state.document

    /*
     * If the local state is ahead of the external model,
     * push local state into the external model
     */
    if (!isEqual(prevDocument, nextDocument)) {
      this.setValue([this.props.valueKey, nextDocument])
    }
  }

  componentDidMount(): void {
    /*
     * Ignore autoSync because this component hasn't
     * been listening to InterfaceBuilder events until now.
     */
    const document: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue
    this.setState({ document })
  }

  componentDidUpdate(
    prevProps: Readonly<CodeEditorInterfaceComponentProps>,
    prevState: Readonly<CodeEditorInterfaceComponentState>
  ): void {
    if (!this.props.autoSync) {
      return
    }

    // Is this a state change or prop change?
    const prevStateDocument = prevState.document
    const nextStateDocument = this.state.document
    const prevExternalDocument: UserInterfaceDataType =
      this.getValue(prevProps.valueKey, prevProps.userInterfaceData, prevProps.getRootUserInterfaceData) ||
      prevProps.defaultValue
    const nextExternalDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue

    /*
     * This update does not involve the document
     */
    if (isEqual(nextExternalDocument, nextStateDocument)) {
      return
    }

    /*
     * If the local state has changed,
     * push local state into the external model
     */
    if (!isEqual(prevStateDocument, nextStateDocument)) {
      this.setValue([this.props.valueKey, nextStateDocument])
      return
    }

    /*
     * If the external model has changed,
     * put the external model into local state
     */
    if (!isEqual(prevExternalDocument, nextExternalDocument)) {
      this.setState({ document: nextExternalDocument })
    }
  }

  /**
   * Handle changes made in the editor
   * @param value
   * @param errors
   */
  private handleChange: CodeEditorProps["onChange"] = ({ value, errors }): void => {
    if (errors.isSome()) {
      console.error("CodeEditorInterfaceComponent.handleChange", errors)
    }
    const prevDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue || ""
    const nextDocument = value || ""

    /*
     * If the editor document has changed:
     * put the editor document into local state,
     * and push the editor document to the external model (when auto sync is enabled).
     */
    if (!isEqual(prevDocument, nextDocument)) {
      this.setState({ document: value })
      // if (this.props.autoSync) {
      //   // Auto Sync editor document with the external model
      //   this.setValue([this.props.valueKey, nextDocument])
      // }
    }
  }

  render(): JSX.Element {
    return (
      <CodeEditor
        document={this.state.document}
        documentDraft={some(this.state.document)}
        height={this.props.height || "400px"}
        language={this.props.defaultLanguage}
        theme={this.props.defaultTheme}
        width={this.props.width || "100%"}
        onChange={this.handleChange}
      />
    )
  }
}
