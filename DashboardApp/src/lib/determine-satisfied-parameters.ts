import { JSONRecord } from "../data/JSON"
import { ParameterItem } from "../data/Report"

export function determineSatisfiedParameters(
  parameters: ParameterItem[],
  parentData: JSONRecord,
  useDefaultValues: boolean = false
): { unsatisfiedByParentParams: ParameterItem[]; satisfiedByParentParams: JSONRecord } {
  return parameters.reduce<ReturnType<typeof determineSatisfiedParameters>>(
    (acc, parameter) =>
      typeof parentData[parameter.name] !== "undefined"
        ? {
            ...acc,
            satisfiedByParentParams: {
              ...acc.satisfiedByParentParams,
              [parameter.name]: parentData[parameter.name],
            },
          }
        : useDefaultValues &&
          parameter.defaultValue.isSome() &&
          typeof parameter.defaultValue.toUndefined() !== "undefined"
        ? {
            ...acc,
            satisfiedByParentParams: {
              ...acc.satisfiedByParentParams,
              [parameter.name]: parameter.defaultValue.toUndefined(),
            },
          }
        : {
            ...acc,
            unsatisfiedByParentParams: [...acc.unsatisfiedByParentParams, parameter],
          },
    { unsatisfiedByParentParams: [], satisfiedByParentParams: {} }
  )
}
