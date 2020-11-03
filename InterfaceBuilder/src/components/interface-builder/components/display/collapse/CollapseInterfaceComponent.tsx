import { Collapse } from "antd"
import { set } from "lodash/fp"
import React from "react"
import { DataPathContext } from "../../../util/DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { collapseManageForm } from "./collapse-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface SectionDefinition {
  title: string
  components: ComponentDefinition[]
}

export interface ICollapseInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "collapse"
  sections: SectionDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]

  accordion?: boolean
}

interface CollapseInterfaceComponentDisplayModeProps extends ICollapseInterfaceComponentProps {
  mode: "display"
}

interface CollapseInterfaceComponentEditModeProps extends ICollapseInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

type CollapseInterfaceComponentProps =
  | CollapseInterfaceComponentDisplayModeProps
  | CollapseInterfaceComponentEditModeProps

export class CollapseInterfaceComponent extends BaseInterfaceComponent<CollapseInterfaceComponentProps> {
  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "collapse",
      title: "Collapse",
      icon: "vertical-align-middle",
      componentDefinition: {
        component: "collapse",
        sections: [],
      },
    }
  }

  static manageForm = collapseManageForm

  render() {
    const { accordion, onChangeData, sections, userInterfaceData } = this.props
    return (
      <Collapse accordion={accordion}>
        {sections.map((section, sectionIndex) => (
          <Collapse.Panel key={sectionIndex} header={section.title}>
            <DataPathContext path={`sections.${sectionIndex}.components`}>
              <ComponentRenderer
                components={section.components}
                data={userInterfaceData}
                onChangeData={onChangeData}
                onChangeSchema={(newSchema) => {
                  if (this.props.mode === "edit") {
                    const { onChangeSchema, userInterfaceSchema } = this.props
                    console.warn("CollapseInterfaceComponent.render", {
                      newSchema,
                      sectionIndex,
                      onChangeSchema: this.props.onChangeSchema,
                      userInterfaceSchema: this.props.userInterfaceSchema,
                    })
                    onChangeSchema &&
                      userInterfaceSchema &&
                      onChangeSchema(set(`sections.${sectionIndex}.components`, newSchema, userInterfaceSchema))
                  }
                }}
              />
            </DataPathContext>
          </Collapse.Panel>
        ))}
      </Collapse>
    )
  }
}
