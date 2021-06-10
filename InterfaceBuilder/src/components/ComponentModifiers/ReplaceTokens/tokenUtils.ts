import { isEmpty, isNull, isUndefined } from "lodash/fp"
import { formatValue } from "../../../lib/valueFormatter"
import { getValue } from "../../../lib/getValue"
import { MatchReducer } from "./types"
import { CoerceableDataType, DataType } from "../../../lib/valueFormatter/types"
import { UserInterfaceProps } from "../../../globalTypes"

/**
 *
 * @param stringTemplate
 * @param valueKey
 * @param localUserInterfaceData
 * @param getRootUserInterfaceData
 */
export function replaceTokens<T extends DataType>(
  stringTemplate: string,
  valueKey: string,
  localUserInterfaceData: UserInterfaceProps["data"],
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
): T {
  /*
   * RegEx test cases
   * https://regex101.com/r/vfVPMl/1
   */
  const regex = /\{(?<dataType>date|number|duration)?\(?(?<token>\$\.?[^(){}:]*)\)?:?(?<format>([CcDdEeFfGgMmNnOoPpRrsTtUuXxYy]|fromNow|toNow|milliseconds|seconds|minutes|hours|days|weeks|months|years|durationLargestUnit|durationMixedUnit)\d{0,2})?}/gm

  // Check for tokens and abort if none
  if (stringTemplate.search(regex) < 0) {
    return stringTemplate as T
  }

  const matchReducer = getMatchReducer(valueKey, localUserInterfaceData, getRootUserInterfaceData)
  let match: RegExpExecArray | null
  let finalText = stringTemplate

  // Replace tokens
  while ((match = regex.exec(stringTemplate)) !== null) {
    // Avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }
    finalText = matchReducer(finalText, match)
  }
  return (!isNull(finalText) && !isUndefined(finalText) ? finalText : stringTemplate) as T
}

/**
 *
 * @param valueKey
 * @param localUserInterfaceData
 * @param getRootUserInterfaceData
 */
function getMatchReducer(
  valueKey: string,
  localUserInterfaceData: UserInterfaceProps["data"],
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
): MatchReducer {
  /**
   * rawTokens can be:
   * {$}
   * {$root}
   * {$:XNN}
   * {dataType($)}
   * {dataType($):XNN}
   * {$.propertyName}
   * {$.propertyName:XNN}
   * {dataType($.propertyName)}
   * {dataType($.propertyName):XNN}
   */
  return (acc: string, matchAry: RegExpExecArray): string => {
    const match = matchAry
    if (!match) {
      return acc
    }

    const rawToken = match[0] // ex.: {$.propertyName}
    const dataType = match.groups && (match.groups.dataType as CoerceableDataType) // ex.: number | date
    const token = match.groups && match.groups.token // ex.: $.propertyName
    const format = match.groups && match.groups.format // ex.: P2

    if (!token || token.length < 1) {
      return acc
    }

    // When the token is "$", show the user the valueKey instead
    // since they are synonymous and valueKey is more informative.
    const defaultValue = rawToken.replace("$", valueKey)

    // Get the value from the local data context, or from $root
    const rawValue = getValue(token, localUserInterfaceData, getRootUserInterfaceData)

    // No formatting, just replace the token
    if (rawToken === acc && isEmpty(dataType) && isEmpty(format)) {
      return rawValue
    }

    // Format the value and then replace the token
    const formattedValue = formatValue(rawValue, format, dataType)
    const value = !isNull(formattedValue) ? formattedValue : defaultValue
    acc = !isNull(formattedValue) ? acc.replace(rawToken, value) : acc.replace(rawToken, defaultValue)
    return acc
  }
}
