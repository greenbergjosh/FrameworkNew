import { Col, Row } from "antd"
import React from "react"
import { DataPathContext } from "../../../../DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { columnManageForm } from "./column-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

interface ColumnModelColumnInterfaceComponent {
  title?: string
  hideTitle?: boolean
  components: ComponentDefinition[]
}

export interface ColumnInterfaceComponentProps extends ComponentDefinitionNamedProps {
  columns: ColumnModelColumnInterfaceComponent[]
  component: "column"
  gutter?: number
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export class ColumnInterfaceComponent extends BaseInterfaceComponent<
  ColumnInterfaceComponentProps
> {
  static defaultProps = {
    addItemLabel: "Add Item",
    columns: [],
    gutter: 8,
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "column",
      title: "Columns",
      icon: "project",
      componentDefinition: {
        component: "column",
        components: [],
      },
    }
  }

  static manageForm = columnManageForm

  render() {
    const { columns, gutter, onChangeData, userInterfaceData } = this.props

    const colSpan = Math.floor(24 / (columns.length || 1))

    return (
      <DataPathContext path="columns">
        <Row type="flex" justify="space-between" gutter={gutter}>
          {columns.map(({ components, hideTitle, title }, columnIndex) => (
            <DataPathContext path={`${columnIndex}`} key={columnIndex}>
              <Col span={colSpan}>
                {hideTitle !== true && title ? <div>{title}</div> : null}
                <DataPathContext path={`components`}>
                  <ComponentRenderer
                    components={components}
                    data={userInterfaceData}
                    onChangeData={onChangeData}
                    onChangeSchema={(newSchema) => {
                      console.warn(
                        "SlotConfigInterfaceComponent.render",
                        "TODO: Cannot alter schema inside ComponentRenderer in SlotConfig",
                        { newSchema }
                      )
                    }}
                  />
                </DataPathContext>
              </Col>
            </DataPathContext>
          ))}
        </Row>
      </DataPathContext>
    )
  }
}
