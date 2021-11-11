import React from "react"
import { BaseInterfaceComponent, LayoutDefinition, UserInterfaceDataType } from "@opg/interface-builder"
import { CodeEditorInterfaceComponentProps, CodeEditorInterfaceComponentState } from "./types.js"
import { settings } from "./settings"
import { isEqual } from "lodash/fp"
import layoutDefinition from "./layoutDefinition"
import { ChangeManager } from "components/ChangeManager"
import { normalize } from "./components/normalize"

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

  static manageForm = settings

  static availableEvents = ["valueChanged"]

  constructor(props: CodeEditorInterfaceComponentProps) {
    super(props)

    this.state = {
      internalDocument: "",
    }
  }

  /**
   * onMount load externalDocument into internalDocument.
   * Ignore autoSync because this component hasn't
   * been listening to InterfaceBuilder events until now.
   */
  componentDidMount(): void {
    const externalDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue
    if (!isEqual(normalize(this.state.internalDocument), normalize(externalDocument))) {
      this.setState({ internalDocument: externalDocument })
    }
  }

  /**
   * Public method for external clients to trigger a load.
   * If the externalDocument is different than internalDocument, put the externalDocument into internalDocument.
   * @public
   */
  public load(): void {
    const externalDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue
    console.log("CodeEditorInterfaceComponent > load", {
      internalDocument: this.state.internalDocument,
      externalDocument,
    })

    if (!isEqual(normalize(this.state.internalDocument), normalize(externalDocument))) {
      this.setState({ internalDocument: externalDocument })
    }
  }

  /**
   * Public method for external clients to trigger a save.
   * If the internalDocument is different than the externalDocument, push internalDocument into the externalDocument.
   * @public
   */
  public save(): void {
    const externalDocument: UserInterfaceDataType = this.getValue(this.props.valueKey) || this.props.defaultValue
    console.log("CodeEditorInterfaceComponent > save", {
      internalDocument: this.state.internalDocument,
      externalDocument,
    })

    if (!isEqual(normalize(externalDocument), normalize(this.state.internalDocument))) {
      // Set external document
      this.setValue([this.props.valueKey, this.state.internalDocument])
    }
  }

  private handleExternalDocumentChange(externalDocument: UserInterfaceDataType): void {
    this.setState({ internalDocument: externalDocument })
  }

  private handleEditorDocumentChange(editorDocument: UserInterfaceDataType): void {
    this.setState({ internalDocument: editorDocument })
  }

  render(): JSX.Element {
    return (
      <ChangeManager
        mode={this.props.mode}
        autoSync={this.props.autoSync}
        defaultLanguage={this.props.defaultLanguage}
        defaultTheme={this.props.defaultTheme}
        getRootUserInterfaceData={this.props.getRootUserInterfaceData}
        getValue={this.getValue.bind(this)}
        height={this.props.height}
        internalDocument={this.state.internalDocument}
        onEditorDocumentChange={this.handleEditorDocumentChange.bind(this)}
        onExternalDocumentChange={this.handleExternalDocumentChange.bind(this)}
        raiseEvent={this.raiseEvent.bind(this)}
        setValue={this.setValue.bind(this)}
        userInterfaceData={this.props.userInterfaceData}
        valueKey={this.props.valueKey}
        width={this.props.width}
      />
    )
  }
}
