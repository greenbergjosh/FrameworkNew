import React from "react"
import { ColProps } from "antd/lib/grid"
import { Form } from "antd"
import { merge, set } from "lodash/fp"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderer,
  DataPathContext,
  LayoutDefinition,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"

interface FormColumnLayout {
  labelCol?: ColProps
  wrapperCol?: ColProps
}

const defaultFormLayout: FormColumnLayout = {
  labelCol: {
    sm: { span: 24 },
    md: { span: 8 },
    lg: { span: 6 },
    xl: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 24 },
    md: { span: 16 },
    lg: { span: 18 },
    xl: { span: 19 },
  },
}

interface IFormInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "form"
  components?: ComponentDefinition[]
  formColumnLayout?: FormColumnLayout
  onChangeData: UserInterfaceProps["onChangeData"]
  orientation: "inline" | "horizontal" | "vertical"
  userInterfaceData?: UserInterfaceProps["data"]
}

interface FormInterfaceComponentDisplayModeProps extends IFormInterfaceComponentProps {
  mode: "display"
}

interface FormInterfaceComponentEditModeProps extends IFormInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

export type FormInterfaceComponentProps = FormInterfaceComponentDisplayModeProps | FormInterfaceComponentEditModeProps

export default class FormInterfaceComponent extends BaseInterfaceComponent<FormInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  render(): JSX.Element {
    const {
      components,
      formColumnLayout,
      onChangeData,
      orientation,
      userInterfaceData,
      getRootUserInterfaceData,
      onChangeRootData,
    } = this.props

    const formLayout = formColumnLayout ? merge(defaultFormLayout, formColumnLayout) : defaultFormLayout

    return (
      <Form layout={orientation} {...formLayout}>
        <DataPathContext path="components">
          <ComponentRenderer
            components={components || ([] as ComponentDefinition[])}
            data={userInterfaceData}
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
            onChangeData={onChangeData}
            onChangeSchema={(newSchema) => {
              if (this.props.mode === "edit") {
                const { onChangeSchema, userInterfaceSchema } = this.props
                console.warn("FormInterfaceComponent.render", {
                  newSchema,
                  onChangeSchema: this.props.onChangeSchema,
                  userInterfaceSchema: this.props.userInterfaceSchema,
                })
                onChangeSchema &&
                  userInterfaceSchema &&
                  onChangeSchema(set("components", newSchema, userInterfaceSchema))
              }
            }}
          />
        </DataPathContext>
      </Form>
    )
  }
}
