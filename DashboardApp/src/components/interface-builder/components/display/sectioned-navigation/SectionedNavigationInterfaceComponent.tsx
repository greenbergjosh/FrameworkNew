import { Data } from "@syncfusion/ej2-grids"
import {
  Button,
  Card,
  Menu,
  PageHeader,
  Popover
  } from "antd"
import React from "react"
import { DataPathContext } from "../../../../DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { sectionedNavigationManageForm } from "./sectioned-navigation-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

interface NavigationSection {
  title: string
  components: ComponentDefinition[]
}

export interface SectionedNavigationInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "sectioned-navigation"
  sections: NavigationSection[]
  defaultActiveKey?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  title?: string
  userInterfaceData?: UserInterfaceProps["data"]
}

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
    const { sections, onChangeData, title, userInterfaceData } = this.props
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
            {sections.map(({ title, components }, index) => (
              <Card hidden={title !== activeSectionKey} title={title}>
                <DataPathContext path={`${index}.components`}>
                  <ComponentRenderer
                    components={components}
                    data={userInterfaceData}
                    onChangeData={onChangeData}
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
