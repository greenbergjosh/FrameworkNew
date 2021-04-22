import { JSONRecord } from "../../../../../globalTypes/JSONTypes"
import { cloneDeep, isEmpty, sortBy } from "lodash/fp"
import moment from "moment"
import { tryCatch } from "fp-ts/lib/Either"
import { evalExpression } from "../../../../../lib/evalExpression"
import { EnrichedColumnDefinition } from "../../StandardGrid/types"

/**
 * Some data may have to be pre-processed in order not to cause the table to fail to render
 * @param data
 * @param columns
 */
export function getUsableData(data: JSONRecord[], columns: EnrichedColumnDefinition[]) {
  /*
   * Iterate on the data
   */
  return cloneDeep(data).map((dataRow) => {
    if (isEmpty(dataRow)) {
      return {}
    }
    /*
     *  Iterate on the columns
     */
    columns.forEach(({ field, type }) => {
      if (field) {
        const value = dataRow[field]
        if ((typeof value === "string" || typeof value === "number") && ["date", "dateTime"].includes(type || "")) {
          // Date type columns must appear as JS Date objects, not strings
          dataRow[field] = moment(value).toDate() as any
        } else if (field[0] === "=") {
          const calculationString = field.substring(1)

          const evald = tryCatch(() => {
            const interpolatedCalculationString = sortBy(
              ([key, value]) => key && key.length,
              Object.entries(dataRow)
            ).reduce((acc: string, [key, value]) => acc.replace(key, String(value)), calculationString)

            return evalExpression(interpolatedCalculationString)
          }).fold(
            (error) => (console.warn("StandardGrid.render", "usableData", field, error), 0) || null,
            (value) => (isNaN(value) || !isFinite(value) ? null : value)
          )

          dataRow[field] = evald
        }
      }
    })

    return dataRow
  })
}
