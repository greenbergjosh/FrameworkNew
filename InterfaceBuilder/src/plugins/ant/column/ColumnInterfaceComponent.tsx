import { Col, Row } from "antd"
import { merge, set } from "lodash/fp"
import React from "react"
import { DataPathContext } from "../../../contexts/DataPathContext"
import { ComponentRenderer } from "components/ComponentRenderer/ComponentRenderer"
import { columnManageForm } from "./column-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { getDefaultsFromComponentDefinitions } from "../../../components/BaseInterfaceComponent/componentDefinitionUtils"
import { ColumnInterfaceComponentProps } from "./types"
import styles from "./column.module.scss"
import { LayoutDefinition } from "../../../globalTypes"

export class ColumnInterfaceComponent extends BaseInterfaceComponent<ColumnInterfaceComponentProps> {
  static defaultProps = {
    addItemLabel: "Add Item",
    columns: [],
    gutter: 8,
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition(): LayoutDefinition {
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

  render(): JSX.Element {
    const {
      columns,
      gutter,
      onChangeData,
      userInterfaceData,
      getRootUserInterfaceData,
      setRootUserInterfaceData,
      submit,
      mode,
      preview,
    } = this.props

    const definedColumnWidths = columns.reduce(
      (acc, { span }) => (span && !isNaN(Number(String(span))) ? { sum: acc.sum + span, count: acc.count + 1 } : acc),
      { sum: 0, count: 0 }
    )
    const colSpan = Math.floor((24 - definedColumnWidths.sum) / (columns.length - definedColumnWidths.count || 1))
    const rowClassName = mode === "edit" || preview ? styles.editMode : undefined

    return (
      <DataPathContext path="columns">
        <Row type="flex" justify="space-between" gutter={gutter} className={rowClassName}>
          {columns.map(({ components, hideTitle, span, title }, columnIndex) => (
            <DataPathContext path={`${columnIndex}`} key={columnIndex}>
              <Col span={span || colSpan}>
                {hideTitle !== true && title ? <div>{title}</div> : null}
                <DataPathContext path={`components`}>
                  <ComponentRenderer
                    components={components}
                    data={userInterfaceData}
                    getRootData={getRootUserInterfaceData}
                    setRootData={setRootUserInterfaceData}
                    onChangeData={onChangeData}
                    onChangeSchema={(newSchema) => {
                      if (this.props.mode === "edit") {
                        const { onChangeSchema, userInterfaceSchema } = this.props
                        onChangeSchema &&
                          userInterfaceSchema &&
                          onChangeSchema(set(`columns.${columnIndex}.components`, newSchema, userInterfaceSchema))
                      }
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
