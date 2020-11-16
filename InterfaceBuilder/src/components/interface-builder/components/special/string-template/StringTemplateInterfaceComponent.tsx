import React from "react"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { stringTemplateManageForm } from "./string-template-manage-form"
import { BaseInterfaceComponent, ComponentDefinition } from "../../base/BaseInterfaceComponent"
import {
  DeserializeType,
  SerializeType,
  StringTemplateInterfaceComponentProps,
  StringTemplateInterfaceComponentState,
} from "./types"
import { QuoteIcon } from "./components/QuoteIcon"
import { DataPathContext } from "components/interface-builder/util/DataPathContext"
import { isEmpty, set } from "lodash/fp"
import { Card } from "antd"
import { JSONRecord } from "index"
import { parseLBM } from "components/interface-builder/components/_shared/LBM/parseLBM"
import { tryCatch } from "fp-ts/lib/Option"

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
    }
  }

  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition() {
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

  handleChangeData = (nextState: object) => {
    const { components, onChangeData, preconfigured, userInterfaceData, valueKey } = this.props
    const serializedData = this.props.serialize
      ? this.props.serialize(nextState as JSONRecord) // First from parent component, if provided
      : this.state.serialize(nextState as JSONRecord) // Else from local config

    onChangeData && onChangeData(set(valueKey, serializedData, userInterfaceData))
  }

  render() {
    const { components, preconfigured, userInterfaceData, getRootUserInterfaceData, valueKey, showBorder } = this.props
    const value = userInterfaceData[valueKey]
    const data =
      value && this.props.deserialize
        ? this.props.deserialize(value) // First from parent component, if provided
        : this.state.deserialize(value) // Else from local config

    return (
      <DataPathContext path="components">
        {showBorder ? (
          <Card size="small" style={{ marginTop: 8, marginBottom: 16 }}>
            <ComponentRenderer
              components={components || ([] as ComponentDefinition[])}
              data={data}
              getRootData={getRootUserInterfaceData}
              dragDropDisabled={!!preconfigured}
              onChangeData={this.handleChangeData}
              onChangeSchema={(newSchema) => {
                console.warn(
                  "StringTemplateInterfaceComponent.render",
                  "TODO: Cannot alter schema inside ComponentRenderer in Card",
                  { newSchema }
                )
              }}
            />
          </Card>
        ) : (
          <ComponentRenderer
            components={components || ([] as ComponentDefinition[])}
            data={data}
            getRootData={getRootUserInterfaceData}
            dragDropDisabled={!!preconfigured}
            onChangeData={this.handleChangeData}
            onChangeSchema={(newSchema) => {
              console.warn(
                "StringTemplateInterfaceComponent.render",
                "TODO: Cannot alter schema inside ComponentRenderer in Card",
                { newSchema }
              )
            }}
          />
        )}
      </DataPathContext>
    )
  }
}
