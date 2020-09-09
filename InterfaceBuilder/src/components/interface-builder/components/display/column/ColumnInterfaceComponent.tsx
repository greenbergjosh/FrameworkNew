import { Col, Row } from "antd"
import { merge } from "lodash/fp"
import React from "react"
import { DataPathContext } from "../../../util/DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { columnManageForm } from "./column-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  getDefaultsFromComponentDefinitions,
} from "../../base/BaseInterfaceComponent"

interface ColumnModelColumnInterfaceComponent {
  title?: string
  hideTitle?: boolean
  components: ComponentDefinition[]
  span?: number
}

export interface ColumnInterfaceComponentProps extends ComponentDefinitionNamedProps {
  columns: ColumnModelColumnInterfaceComponent[]
  component: "column"
  gutter?: number
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  submit?: UserInterfaceProps["submit"]
}

export class ColumnInterfaceComponent extends BaseInterfaceComponent<ColumnInterfaceComponentProps> {
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

  static getDefinitionDefaultValue({ columns }: ColumnInterfaceComponentProps) {
    return (columns || []).reduce(
      (acc, column) => merge(acc, getDefaultsFromComponentDefinitions(column.components)),
      {}
    )
  }

  getDefaultValue = () => {
    return ColumnInterfaceComponent.getDefinitionDefaultValue(this.props)
  }

  render() {
    const { columns, gutter, onChangeData, userInterfaceData, submit } = this.props

    const definedColumnWidths = columns.reduce(
      (acc, { span }) => (span && !isNaN(Number(String(span))) ? { sum: acc.sum + span, count: acc.count + 1 } : acc),
      { sum: 0, count: 0 }
    )
    const colSpan = Math.floor((24 - definedColumnWidths.sum) / (columns.length - definedColumnWidths.count || 1))

    return (
      <DataPathContext path="columns">
        <Row type="flex" justify="space-between" gutter={gutter}>
          {columns.map(({ components, hideTitle, span, title }, columnIndex) => (
            <DataPathContext path={`${columnIndex}`} key={columnIndex}>
              <Col span={span || colSpan}>
                {hideTitle !== true && title ? <div>{title}</div> : null}
                <DataPathContext path={`components`}>
                  <ComponentRenderer
                    components={components}
                    data={userInterfaceData}
                    onChangeData={onChangeData}
                    onChangeSchema={(newSchema) => {
                      console.warn(
                        "ColumnInterfaceComponent.render",
                        "TODO: Cannot alter schema inside ComponentRenderer in Column",
                        { newSchema }
                      )
                    }}
                    submit={submit}
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
