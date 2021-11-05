import DisplayMode from "./components/DisplayMode"
import EditMode from "./components/EditMode"
import React from "react"
import styled, { css } from "styled-components"
import { BaseInterfaceComponent, ComponentRendererModeContext, LayoutDefinition } from "@opg/interface-builder"
import { ListInterfaceComponentProps } from "./types"
import { settings } from "./settings"
import { v4 as uuid } from "uuid"
import layoutDefinition from "./layoutDefinition"

const Div = styled.div`
  ${({ styleString }: { styleString: string }) => css`
    ${styleString}
  `}
`

export default class ListInterfaceComponent extends BaseInterfaceComponent<ListInterfaceComponentProps> {
  static defaultProps = {
    addItemLabel: "Add Item",
    allowDelete: true,
    allowReorder: true,
    orientation: "vertical",
    interleave: "none",
    unwrapped: false,
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  listId = uuid()

  render(): JSX.Element {
    const {
      addItemLabel,
      components,
      emptyText,
      interleave,
      orientation,
      preconfigured,
      unwrapped,
      userInterfaceData,
      getRootUserInterfaceData,
      onChangeRootData,
      valueKey,
    } = this.props

    // Get the list data from the data set
    const data = this.getValue(valueKey) || []

    return (
      <ComponentRendererModeContext.Consumer>
        {(mode) => {
          switch (mode) {
            case "display": {
              return (
                <Div styleString={this.props.style} className={"display-mode"}>
                  <DisplayMode
                    addItemLabel={addItemLabel}
                    components={components}
                    data={data}
                    getRootUserInterfaceData={getRootUserInterfaceData}
                    onChangeRootData={onChangeRootData}
                    getValue={this.getValue.bind(this)}
                    setValue={this.setValue.bind(this)}
                    description={emptyText}
                    interleave={interleave}
                    listId={this.listId}
                    orientation={orientation}
                    unwrapped={unwrapped}
                    userInterfaceData={userInterfaceData}
                    valueKey={valueKey}
                    getDefinitionDefaultValue={ListInterfaceComponent.getDefinitionDefaultValue}
                  />
                </Div>
              )
            }
            case "preview": {
              return (
                <Div styleString={this.props.style} className={"display-mode"}>
                  <DisplayMode
                    addItemLabel={addItemLabel}
                    components={components}
                    data={[]}
                    getRootUserInterfaceData={() => void 0}
                    onChangeRootData={() => void 0}
                    getValue={() => null}
                    setValue={() => null}
                    description={emptyText}
                    interleave={interleave}
                    listId={this.listId}
                    orientation={orientation}
                    unwrapped={unwrapped}
                    userInterfaceData={userInterfaceData}
                    valueKey={valueKey}
                    getDefinitionDefaultValue={ListInterfaceComponent.getDefinitionDefaultValue}
                  />
                </Div>
              )
            }
            case "edit": {
              // Repeat the component once per item in the list
              return (
                <EditMode
                  components={components}
                  data={data}
                  getRootUserInterfaceData={getRootUserInterfaceData}
                  onChangeRootData={onChangeRootData}
                  getValue={this.getValue.bind(this)}
                  setValue={this.setValue.bind(this)}
                  interleave={interleave}
                  preconfigured={preconfigured}
                  valueKey={valueKey}
                  getDefinitionDefaultValue={ListInterfaceComponent.getDefinitionDefaultValue}
                />
              )
            }
          }
        }}
      </ComponentRendererModeContext.Consumer>
    )
  }
}
