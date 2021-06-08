import React from "react"
import { ComponentRenderer } from "components/ComponentRenderer"
import { stringTemplateManageForm } from "./string-template-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import {
  DeserializeType,
  SerializeType,
  StringTemplateInterfaceComponentProps,
  StringTemplateInterfaceComponentState,
} from "./types"
import { QuoteIcon } from "./components/QuoteIcon"
import { DataPathContext } from "../../../contexts/DataPathContext"
import { isEmpty } from "lodash/fp"
import { Card } from "antd"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { parseLBM } from "../../../lib/parseLBM"
import { tryCatch } from "fp-ts/lib/Option"
import { ComponentDefinition, LayoutDefinition } from "../../../globalTypes"

export class StringTemplateInterfaceComponent extends BaseInterfaceComponent<
  StringTemplateInterfaceComponentProps,
  StringTemplateInterfaceComponentState
> {
  constructor(props: StringTemplateInterfaceComponentProps) {
    super(props)

    this.state = {
      serialize(value?: JSONRecord | JSONRecord[]) {
        return value && JSON.stringify(value)
      },
      deserialize(value?: string) {
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
    return {
      category: "Special",
      name: "string-template",
      title: "String Template",
      description: `Edit a string using form controls.
        ADVANCED: You can provide serialize and deserialize functions;
        otherwise, the value will be a serialized JSON string.
        The serialize function must take a JSON object and return a string.
        The deserialize function must take a string and return
        a JSON object with properties that match each "API Key" used in the embedded controls.`,
      iconComponent: QuoteIcon,
      componentDefinition: {
        component: "string-template",
        components: [],
      },
    }
  }

  static manageForm = stringTemplateManageForm

  componentDidMount(): void {
    // Load local config serialize function, if provided
    if (!isEmpty(this.props.serializeSrc)) {
      const serialize = parseLBM<SerializeType>(this.props.serializeSrc)
      serialize && this.setState({ serialize })
    }

    // Load local config deserialize function, if provided
    if (!isEmpty(this.props.deserializeSrc)) {
      const deserialize = parseLBM<DeserializeType>(this.props.deserializeSrc)
      deserialize && this.setState({ deserialize })
    }
  }

  componentDidUpdate(
    prevProps: Readonly<StringTemplateInterfaceComponentProps>,
    prevState: Readonly<StringTemplateInterfaceComponentState>
  ): void {
    const prevValue = this.getValue(prevProps.valueKey) as string | undefined
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

    const data =
      value && this.props.deserialize
        ? this.props.deserialize(value) // First from parent component, if provided
        : this.state.deserialize(value) // Else from local config

    this.setState({ data })
  }

  handleChangeFromSubcomponents = (changeData: JSONRecord): void => {
    const nextData = { ...this.state.data, ...changeData }

    this.setState({ data: nextData })
    const serializedData = this.props.serialize
      ? this.props.serialize(nextData) // First from parent component, if provided
      : this.state.serialize(nextData) // Else from local config

    this.setValue([this.props.valueKey, serializedData])
  }

  render(): JSX.Element {
    const { components, preconfigured, getRootUserInterfaceData, onChangeRootData, showBorder } = this.props

    return (
      <DataPathContext path="components">
        {showBorder ? (
          <Card size="small" style={{ marginTop: 8, marginBottom: 16 }}>
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
          </Card>
        ) : (
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
        )}
      </DataPathContext>
    )
  }
}
