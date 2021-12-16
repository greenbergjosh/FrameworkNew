import { JSONRecord } from "../../../../lib/JSONRecord"
import { ParameterItem } from "../../../../api/ReportCodecs"
import { SortedParamsType } from "./types"

function sortParam(
  sortedParams: SortedParamsType,
  parentData: JSONRecord,
  parameter: ParameterItem,
  useDefaultValues: boolean
) {
  // Parameter exists in parentData so add it to satisfied params
  if (typeof parentData[parameter.name] !== "undefined") {
    return {
      ...sortedParams,
      satisfiedByParentParams: {
        ...sortedParams.satisfiedByParentParams,
        [parameter.name]: parentData[parameter.name],
      },
    }
  }

  // Parameter doesn't exist in parentData,
  // but we can add the Parameter's default to satisfied param
  if (
    useDefaultValues &&
    parameter.defaultValue.isSome() &&
    typeof parameter.defaultValue.toUndefined() !== "undefined"
  ) {
    return {
      ...sortedParams,
      satisfiedByParentParams: {
        ...sortedParams.satisfiedByParentParams,
        [parameter.name]: parameter.defaultValue.toUndefined(),
      },
    }
  }

  // Parameter doesn't exist in parentData and we can't add the default,
  // so add it to unsatisfied params.
  return {
    ...sortedParams,
    unsatisfiedByParentParams: [...sortedParams.unsatisfiedByParentParams, parameter],
  }
}

/**
 * Sorts parameters as satisfied and unsatisfied
 * @param parameters
 * @param parentData - Data received from a parent report's row
 * @param useDefaultValues
 */
export function determineSatisfiedParameters(
  parameters: ParameterItem[],
  parentData: JSONRecord,
  useDefaultValues = false
): SortedParamsType {
  const sortingReducer = (acc: SortedParamsType, parameter: ParameterItem) =>
    sortParam(acc, parentData, parameter, useDefaultValues)
  const sortedParams: SortedParamsType = {
    unsatisfiedByParentParams: [],
    satisfiedByParentParams: {},
  }

  return parameters.reduce<SortedParamsType>(sortingReducer, sortedParams)
}
