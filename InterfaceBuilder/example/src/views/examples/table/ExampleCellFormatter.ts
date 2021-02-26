/**
 * When assigned to a column via the Table columns configuration,
 * this function is executed for each cell in a grid column when.
 * @param column - Type is Syncfusion Grid Column, see https://ej2.syncfusion.com/react/documentation/api/grid/column/#formatter
 * @param data - The row's data
 * @param options - Optional object containing additional properties passed from column configuration
 */
export const cellFormatter = (column: any, data: any, options: any) => {
  const value = data[column.field]
  const isNumber = value && typeof value === "number"
  const displayValue = value !== null ? column.formatFn(value) : ""

  if (isNumber && 0.3 < value && value <= 1) {
    return displayValue
  } else if (isNumber && 1 < value) {
    return `<span style="color: blue">${displayValue}</span>`
  }
  return `<span style="color: red">${displayValue}</span>`
}
