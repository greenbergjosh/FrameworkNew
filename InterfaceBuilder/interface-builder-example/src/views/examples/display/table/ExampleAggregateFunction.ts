import { v4 as uuid } from "uuid"
import StandardGridTypes from "@opg/interface-builder-plugins/lib/syncfusion/table/StandardGrid/types"
import { JSONRecord } from "@opg/interface-builder"

/**
 * When assigned to a column via the Table columns configuration,
 * this function is executed for that column in the footer.
 * ** NOTE: This function returns an outer and inner function. The outer function
 * provides additional context data. The inner function is what gets
 * executed when the column's aggregate value is calculated.
 * @param columns - Type is Syncfusion Grid Column, see https://ej2.syncfusion.com/react/documentation/api/grid/column/
 * @param columnCounts - The column's row count
 * @param options - The options configured for this Custom Aggregate
 */
const customAggregateFunction = (
  columns: StandardGridTypes.EnrichedColumnDefinition,
  columnCounts: number,
  options: JSONRecord
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  return function (data: any /*, aggregateColumn: unknown*/): number | null {
    console.log("Report.CustomAggregate.DivideTwoSums")

    // When a report is exported, it runs the group aggregate function
    // which does not provide data.aggregates. See https://ej2.syncfusion.com/react/documentation/grid/aggregate/#custom-aggregate
    if (!data || !data.aggregates) {
      return null
    }

    // Aggregate options are at data.aggregates[options.YOUR_OPTION_KEY + " - sum"];
    // Sum aggregate properties automatically get the suffix " - sum",
    // the same pattern applies to the other aggregate
    const numerator_key = `${options.numerator} - sum`
    const denominator_key = `${options.denominator} - sum`
    let numerator = null
    let denominator = null

    if (numerator_key in data.aggregates) {
      numerator = data.aggregates[numerator_key]
    } else {
      console.warn(
        `Numerator ${numerator_key} not defined. Check that column is in report and is aggregated as a sum.`
      )
    }

    if (denominator_key in data.aggregates) {
      denominator = data.aggregates[denominator_key]
    } else {
      console.warn(
        `Denominator ${denominator_key} not defined. Check that column is in report and is aggregated.`
      )
    }

    // Do aggregate logic here
    if (!denominator || denominator === 0 || !numerator || numerator === 0) {
      return 0
    }

    // Return the value to display
    return numerator / denominator
  }
}

export const columnConfigWithCustomAggregateFunction = {
  details: {
    type: "layout",
  },
  customFormat: "MM/dd/yyyy hh:mm:ss a",
  skeletonFormat: "short",
  precision: 2,
  format: "percentage",
  type: "number",
  field: "AggTest",
  headerText: "Agg Test",
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  customAggregateFunction,
  customAggregateOptions: {
    numerator: "PathOnlyRevenuePerLead",
    denominator: "GlobalPathRevenue",
  },
  customAggregateId: uuid(),
  aggregationFunction: "Custom",
}
