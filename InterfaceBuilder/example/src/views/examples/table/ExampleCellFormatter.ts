import { EnrichedColumnDefinition, JSONRecord } from "@opg/interface-builder"

interface EnrichedColumnDefinitionWithFormatFn extends EnrichedColumnDefinition {
  formatFn: (value: unknown) => unknown
}

/**
 * When assigned to a column via the Table columns configuration,
 * this function is executed for each cell in a grid column when.
 * @param column - Type is Syncfusion Grid Column, see https://ej2.syncfusion.com/react/documentation/api/grid/column/#formatter
 * @param data - The row's data
 */
export const cellFormatter = (
  column: EnrichedColumnDefinitionWithFormatFn,
  data: JSONRecord
  /*,options: any*/
): unknown => {
  const value = column.field && data[column.field]
  const isNumber = value && typeof value === "number"
  const displayValue = value !== null ? column.formatFn(value) : ""

  if (value && isNumber && 0.3 < value && value <= 1) {
    return displayValue
  } else if (value && isNumber && 1 < value) {
    return `<span style="color: blue">${displayValue}</span>`
  }
  return `<span style="color: red">${displayValue}</span>`
}
