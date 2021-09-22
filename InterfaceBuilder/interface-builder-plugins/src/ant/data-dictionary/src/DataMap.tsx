import { Button, Col, Row } from "antd"
import React from "react"

interface DataItem {}

export interface DataMapProps {
  count?: number
  data: DataItem[]
  keyLabel: string
  onDataChanged: (data: DataMapProps["data"]) => void
  multiple?: boolean
  renderKeyComponent: (item: DataItem, onChange: (item: DataItem) => void) => JSX.Element | JSX.Element[]
  renderValueComponent: (item: DataItem, onChange: (item: DataItem) => void) => JSX.Element | JSX.Element[]
  valueLabel: string
}

const itemChangeHandler = (data: DataMapProps["data"], index: number, onDataChanged: DataMapProps["onDataChanged"]) => (
  updatedItem: DataItem
) => onDataChanged([...data.slice(0, index), updatedItem, ...data.slice(index + 1)])

const itemDeleteHandler = (
  data: DataMapProps["data"],
  index: number,
  onDataChanged: DataMapProps["onDataChanged"]
) => () => onDataChanged([...data.slice(0, index), ...data.slice(index + 1)])

const rowProps = {
  gutter: 16,
}
const colProps = {
  span: 10,
}
const deleteColumnProps = {
  span: 4,
}

export const DataMap = ({
  count,
  data,
  keyLabel,
  onDataChanged,
  multiple,
  renderKeyComponent,
  renderValueComponent,
  valueLabel,
}: DataMapProps) => {
  const headerRow = (
    <Row key="header" {...rowProps}>
      <Col {...colProps}>{keyLabel}</Col>
      <Col {...colProps}>{valueLabel}</Col>
    </Row>
  )

  const hasCount = typeof count === "number"

  const iterable = hasCount ? [...data] : multiple || data.length === 0 ? [...data, {}] : data

  if (typeof count === "number") {
    while (iterable.length < count) {
      iterable.push({})
    }
  }

  const items = iterable.map((dataItem, index) => (
    <Row key={index} {...rowProps}>
      <Col {...colProps}>{renderKeyComponent(dataItem, itemChangeHandler(data, index, onDataChanged))}</Col>
      <Col {...colProps}>{renderValueComponent(dataItem, itemChangeHandler(data, index, onDataChanged))}</Col>
      {!hasCount && (
        <Col {...deleteColumnProps}>
          {index < data.length && (
            <Button
              style={{ padding: 1 }}
              icon="close"
              onClick={itemDeleteHandler(data, index, onDataChanged)}
              type="danger"
            />
          )}
        </Col>
      )}
    </Row>
  ))

  return (
    <>
      {headerRow}
      {items}
    </>
  )
}

DataMap.defaultProps = {
  data: [],
  keyLabel: "key",
  valueLabel: "value",
}
