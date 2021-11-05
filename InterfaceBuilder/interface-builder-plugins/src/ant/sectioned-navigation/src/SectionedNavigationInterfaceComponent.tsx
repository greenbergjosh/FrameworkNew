import React from "react"
import { Button, Card, Menu, PageHeader, Popover } from "antd"
import { set } from "lodash/fp"
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

export default class SectionedNavigationInterfaceComponent extends BaseInterfaceComponent<
  SectionedNavigationInterfaceComponentProps,
  SectionedNavigationInterfaceComponentState
> {
  static defaultProps = {
    sections: [],
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  state = { activeKey: null }

  componentDidMount() {
    if (this.props.defaultActiveKey) {
      this.setState({ activeKey: this.props.defaultActiveKey })
    }
  }

  render(): JSX.Element {
    const {
      onChangeData,
      sections,
      title,
      userInterfaceData,
      getRootUserInterfaceData,
      onChangeRootData,
    } = this.props
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
              <Card key={`section-${sectionIndex}`} hidden={title !== activeSectionKey} title={title}>
                <DataPathContext path={`${sectionIndex}.components`}>
                  <ComponentRenderer
                    components={components}
                    data={userInterfaceData}
                    getRootUserInterfaceData={getRootUserInterfaceData}
                    onChangeRootData={onChangeRootData}
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
