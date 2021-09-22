import React from "react"
import { BaseInterfaceComponent, LayoutDefinition, UserInterfaceDataType } from "@opg/interface-builder"
import { CodeEditor } from "./components/CodeEditor"
import { CodeEditorInterfaceComponentProps, CodeEditorInterfaceComponentState } from "./types.js"
import { codeEditorManageForm } from "./code-editor-manage-form"
import { CodeEditorProps } from "./types"
import { isEqual, cloneDeep } from "lodash/fp"
import layoutDefinition from "./layoutDefinition"

export default class CodeEditorInterfaceComponent extends BaseInterfaceComponent<
  CodeEditorInterfaceComponentProps,
  CodeEditorInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "code",
    defaultValue: "",
    autoSync: true,
    defaultLanguage: "json",
    showMinimap: true,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
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
    const prevDocument = this.state.document
    const nextDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue
    console.log("CodeEditorInterfaceComponent > load", { document: nextDocument })

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
    const prevDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue
    const nextDocument = this.state.document
    console.log("CodeEditorInterfaceComponent > save", { document: nextDocument })

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
    console.log("CodeEditorInterfaceComponent > mount", { document })
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
    console.log("CodeEditorInterfaceComponent > update", { document: nextExternalDocument })

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
      console.error("CodeEditorInterfaceComponent.handleChange", { errors })
    }
    console.log("CodeEditorInterfaceComponent.handleChange", { value })
    const prevDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue || ""
    const nextDocument = value || ""

    /*
     * If the editor document has changed:
     * put the editor document into local state,
     * and push the editor document to the external model (when auto sync is enabled).
     */
    if (!isEqual(prevDocument, nextDocument)) {
      this.setState({ document: value })
    }
  }

  render(): JSX.Element {
    return (
      <CodeEditor
        original={cloneDeep(this.getValue(this.props.valueKey) || this.props.defaultValue)}
        document={this.state.document}
        height={this.props.height || "400px"}
        language={this.props.defaultLanguage}
        theme={this.props.defaultTheme}
        width={this.props.width || "100%"}
        onChange={this.handleChange}
        raiseEvent={this.raiseEvent.bind(this)}
        showMinimap={this.props.showMinimap}
      />
    )
  }
}
