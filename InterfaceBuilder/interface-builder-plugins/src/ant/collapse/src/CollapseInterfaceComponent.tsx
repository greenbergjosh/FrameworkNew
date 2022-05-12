import { Collapse } from "antd"
import { set } from "lodash/fp"
import React from "react"
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

export interface SectionDefinition {
  title: string
  components: ComponentDefinition[]
  extra?: ComponentDefinition[]
  disabled?: boolean
}

export interface ICollapseInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "collapse"
  sections: SectionDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]

  accordion?: boolean
  bordered?: boolean
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

export default class CollapseInterfaceComponent extends BaseInterfaceComponent<CollapseInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  /**
   *
   * @param section
   * @param sectionIndex
   */
  getExtra(section: SectionDefinition, sectionIndex: number) {
    if (!section.extra && this.props.mode !== "edit") {
      return null
    }
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <DataPathContext path={`sections.${sectionIndex}.extra`}>
          <ComponentRenderer
            components={section.extra || []}
            data={this.props.userInterfaceData}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            onChangeRootData={this.props.onChangeRootData}
            onChangeData={this.props.onChangeData}
            onChangeSchema={(newSchema) => {
              if (this.props.mode === "edit") {
                const { onChangeSchema, userInterfaceSchema } = this.props
                onChangeSchema &&
                  userInterfaceSchema &&
                  onChangeSchema(set(`sections.${sectionIndex}.extra`, newSchema, userInterfaceSchema))
              }
            }}
          />
        </DataPathContext>
      </div>
    )
  }

  render(): JSX.Element {
    const {
      accordion,
      bordered,
      onChangeData,
      sections,
      userInterfaceData,
      getRootUserInterfaceData,
      onChangeRootData,
    } = this.props
    return (
      <Collapse accordion={accordion} bordered={bordered}>
        {sections.map((section, sectionIndex) => (
          <Collapse.Panel
            key={sectionIndex}
            header={section.title}
            extra={this.getExtra(section, sectionIndex)}
            disabled={section.disabled}>
            <DataPathContext path={`sections.${sectionIndex}.components`}>
              <ComponentRenderer
                components={section.components}
                data={userInterfaceData}
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
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
