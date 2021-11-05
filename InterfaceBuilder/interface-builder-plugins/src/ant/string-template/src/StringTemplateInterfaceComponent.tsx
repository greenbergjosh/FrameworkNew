import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentRenderer,
  DataPathContext,
  EventBus,
  getMergedData,
  JSONRecord,
  LayoutDefinition,
  utils,
} from "@opg/interface-builder"
import { Card } from "antd"
import { isEmpty, toPairs } from "lodash/fp"
import styled, { css } from "styled-components"
import { StringTemplateInterfaceComponentProps, StringTemplateInterfaceComponentState } from "./types"
import { settings } from "./settings"
import { tryCatch } from "fp-ts/lib/Option"
import layoutDefinition from "./layoutDefinition"

const Div = styled.div`
  ${({ styleString }: { styleString: string }) => css`
    ${styleString}
  `}
`

export default class StringTemplateInterfaceComponent extends BaseInterfaceComponent<
  StringTemplateInterfaceComponentProps,
  StringTemplateInterfaceComponentState
> {
  constructor(props: StringTemplateInterfaceComponentProps) {
    super(props)

    this.state = {
      serialize({ args: { value } }) {
        return value && JSON.stringify(value)
      },
      deserialize({ args: { value } }) {
        return tryCatch(() => value && JSON.parse(value)).toUndefined()
      },
      data: {},
    }
  }

  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  componentDidMount(): void {
    this.parseSerializeSrc()
    this.parseDeserializeSrc()
  }

  private parseDeserializeSrc() {
    // Load local config deserialize function, if provided
    if (!isEmpty(this.props.deserializeSrc)) {
      const deserialize = utils.parseLBM<
        StringTemplateInterfaceComponentProps,
        { value?: string },
        (JSONRecord | JSONRecord[]) | undefined
      >(this.props.deserializeSrc)
      deserialize && this.setState({ deserialize })
    }
  }

  private parseSerializeSrc() {
    // Load local config serialize function, if provided
    if (!isEmpty(this.props.serializeSrc)) {
      // export type SerializeType = (value?: JSONRecord | JSONRecord[]) => string | undefined
      const serialize = utils.parseLBM<
        StringTemplateInterfaceComponentProps,
        { value?: JSONRecord | JSONRecord[] },
        string | undefined
      >(this.props.serializeSrc)
      serialize && this.setState({ serialize })
    }
  }

  componentDidUpdate(
    prevProps: Readonly<StringTemplateInterfaceComponentProps>,
    prevState: Readonly<StringTemplateInterfaceComponentState>
  ): void {
    if (prevProps.serializeSrc !== this.props.serializeSrc) {
      this.parseSerializeSrc()
    }
    if (prevProps.deserializeSrc !== this.props.deserializeSrc) {
      this.parseDeserializeSrc()
    }
    const prevValue = this.getValue(prevProps.valueKey, prevProps.userInterfaceData) as string | undefined
    const value = this.getValue(this.props.valueKey) as string | undefined

    if (
      prevProps.valueKey === this.props.valueKey &&
      prevProps.serialize === this.props.serialize &&
      prevProps.deserialize === this.props.deserialize &&
      prevState.serialize === this.state.serialize &&
      prevState.deserialize === this.state.deserialize &&
      prevValue === value
    ) {
      return
    }

    const params = {
      props: this.props,
      lib: {
        getValue: this.getValue.bind(this),
        setValue: this.setValue.bind(this),
        raiseEvent: EventBus.raiseEvent,
      },
      args: { value },
    }
    const data =
      value && this.props.deserialize
        ? this.props.deserialize(params) // First from parent component, if provided
        : this.state.deserialize(params) // Else from local config

    this.setState({ data })
  }

  /**
   * Sets the value in local or root UI parentRowData.
   * Provide the "$root." keyword at the beginning of the value key to use root UI parentRowData.
   * @param changeData
   */
  handleChangeFromSubcomponents = (changeData: JSONRecord): void => {
    const changeKVPs = toPairs(changeData)
    const { isLocalDataDirty, isRootDataDirty, localData, rootData } = getMergedData(
      changeKVPs,
      this.state.data || {},
      this.props.getRootUserInterfaceData
    )
    isRootDataDirty ? this.props.onChangeRootData(rootData) : void 0
    const nextData = isLocalDataDirty ? localData : this.state.data
    this.setState({ data: nextData })
    const params = {
      props: this.props,
      lib: {
        getValue: this.getValue.bind(this),
        setValue: this.setValue.bind(this),
        raiseEvent: EventBus.raiseEvent,
      },
      args: { value: nextData },
    }
    const serializedData = this.props.serialize
      ? this.props.serialize(params) // First from parent component, if provided
      : this.state.serialize(params) // Else from local config

    this.setValue([this.props.valueKey, serializedData])
  }

  render(): JSX.Element {
    const { components, preconfigured, getRootUserInterfaceData, onChangeRootData, showBorder } = this.props

    return (
      <DataPathContext path="components">
        {showBorder ? (
          <Card size="small" style={{ marginTop: 8, marginBottom: 16 }}>
            <Div styleString={this.props.style} className={"container"}>
              <ComponentRenderer
                components={components || ([] as ComponentDefinition[])}
                data={this.state.data}
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
                dragDropDisabled={!!preconfigured}
                onChangeData={this.handleChangeFromSubcomponents}
                onChangeSchema={(newSchema) => {
                  console.warn(
                    "StringTemplateInterfaceComponent.render",
                    "TODO: Cannot alter schema inside ComponentRenderer in StringTemplate",
                    { newSchema }
                  )
                }}
              />
            </Div>
          </Card>
        ) : (
          <Div styleString={this.props.style} className={"container"}>
            <ComponentRenderer
              components={components || ([] as ComponentDefinition[])}
              data={this.state.data}
              getRootUserInterfaceData={getRootUserInterfaceData}
              onChangeRootData={onChangeRootData}
              dragDropDisabled={!!preconfigured}
              onChangeData={this.handleChangeFromSubcomponents}
              onChangeSchema={(newSchema) => {
                console.warn(
                  "StringTemplateInterfaceComponent.render",
                  "TODO: Cannot alter schema inside ComponentRenderer in StringTemplate",
                  { newSchema }
                )
              }}
            />
          </Div>
        )}
      </DataPathContext>
    )
  }
}
