import { Button, Card, Menu, PageHeader, Popover } from "antd"
import { set } from "lodash/fp"
import React from "react"
import { DataPathContext } from "../../../util/DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { sectionedNavigationManageForm } from "./sectioned-navigation-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

interface NavigationSection {
  title: string
  components: ComponentDefinition[]
}

export interface ISectionedNavigationInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "sectioned-navigation"
  sections: NavigationSection[]
  defaultActiveKey?: string
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  title?: string
  userInterfaceData?: UserInterfaceProps["data"]
}

interface SectionedNavigationInterfaceComponentDisplayModeProps extends ISectionedNavigationInterfaceComponentProps {
  mode: "display"
}

interface SectionedNavigationInterfaceComponentEditModeProps extends ISectionedNavigationInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

type SectionedNavigationInterfaceComponentProps =
  | SectionedNavigationInterfaceComponentDisplayModeProps
  | SectionedNavigationInterfaceComponentEditModeProps

export interface SectionedNavigationInterfaceComponentState {
  activeKey: string | null
}

export class SectionedNavigationInterfaceComponent extends BaseInterfaceComponent<
  SectionedNavigationInterfaceComponentProps,
  SectionedNavigationInterfaceComponentState
> {
  static defaultProps = {
    sections: [],
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "sectioned-navigation",
      title: "Sectioned Navigation",
      icon: "more",
      componentDefinition: {
        component: "sectioned-navigation",
        sections: [],
      },
    }
  }

  static manageForm = sectionedNavigationManageForm

  state = { activeKey: null }

  componentDidMount() {
    if (this.props.defaultActiveKey) {
      this.setState({ activeKey: this.props.defaultActiveKey })
    }
  }

  render() {
    const { onChangeData, sections, title, userInterfaceData } = this.props
    const { activeKey } = this.state
    const activeSectionKey = activeKey || (sections[0] && sections[0].title)

    const menu = (
      <Menu style={{ width: 256 }} selectedKeys={[activeSectionKey]}>
        {sections.map(({ title }) => (
          <Menu.Item key={title} title={title} onClick={() => this.setState({ activeKey: title })}>
            {title}
          </Menu.Item>
        ))}
      </Menu>
    )

    return (
      <PageHeader
        title={
          <>
            <Popover content={menu} trigger="focus">
              <Button icon="more" />
            </Popover>
            <span style={{ marginLeft: 15 }}>{title}</span>
          </>
        }>
        <DataPathContext path="sections">
          <>
            {sections.map(({ title, components }, sectionIndex) => (
              <Card hidden={title !== activeSectionKey} title={title}>
                <DataPathContext path={`${sectionIndex}.components`}>
                  <ComponentRenderer
                    components={components}
                    data={userInterfaceData}
                    onChangeData={onChangeData}
                    onChangeSchema={(newSchema) => {
                      if (this.props.mode === "edit") {
                        const { onChangeSchema, userInterfaceSchema } = this.props
                        console.warn("SectionedNavigationInterfaceComponent.render", {
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
              </Card>
            ))}
          </>
        </DataPathContext>
      </PageHeader>
    )
  }
}
