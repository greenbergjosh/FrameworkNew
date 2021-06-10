import { Form } from "antd"
import { ColProps } from "antd/lib/grid"
import { merge, set } from "lodash/fp"
import React from "react"
import { ComponentRenderer } from "../../../components/ComponentRenderer/ComponentRenderer"
import { DataPathContext } from "../../../contexts/DataPathContext"
import { formManageForm } from "./form-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../../globalTypes"

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

export class FormInterfaceComponent extends BaseInterfaceComponent<FormInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
      name: "form",
      title: "Form",
      icon: "form",
      componentDefinition: {
        component: "form",
        label: "Form",
        components: [],
      },
    }
  }

  static manageForm = formManageForm

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
