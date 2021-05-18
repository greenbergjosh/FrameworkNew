import { get, isEmpty, isNull } from "lodash/fp"
import { formatValue } from "../../lib/valueFormatter"
import { MatchReducer } from "./types"
import { CoerceableDataType, DataType } from "../../lib/valueFormatter/types"
import { UserInterfaceProps } from "../../globalTypes"

/*
 * Test cases
 * https://regex101.com/r/vfVPMl/1
 */
const pattern = /\{(?<dataType>date|number|duration)?\(?(?<token>\$\.?[^(){}:]*)\)?:?(?<format>([CcDdEeFfGgMmNnOoPpRrsTtUuXxYy]|fromNow|toNow|milliseconds|seconds|minutes|hours|days|weeks|months|years|durationLargestUnit|durationMixedUnit)\d{0,2})?}/gm

/**
 *
 * @param stringTemplate
 * @param data
 * @param rootValueKey
 * @param mode
 */
export function replaceTokens<T extends DataType>(
  stringTemplate: string,
  data: DataType,
  rootValueKey: string,
  mode: UserInterfaceProps["mode"]
): T {
  const regex = /\{(?<dataType>date|number|duration)?\(?(?<token>\$\.?[^(){}:]*)\)?:?(?<format>([CcDdEeFfGgMmNnOoPpRrsTtUuXxYy]|fromNow|toNow|milliseconds|seconds|minutes|hours|days|weeks|months|years|durationLargestUnit|durationMixedUnit)\d{0,2})?}/gm

  const matchReducer = getMatchReducer(rootValueKey, data, mode)
  let match: RegExpExecArray | null
  let finalText = stringTemplate

  while ((match = regex.exec(stringTemplate)) !== null) {
    // Avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }
    finalText = matchReducer(finalText, match)
  }
  return (!isNull(finalText) ? finalText : stringTemplate) as T
}

/**
 *
 * @param stringTemplate
 */
export function hasTokens(stringTemplate: string): boolean {
  return stringTemplate.search(pattern) > -1
}

/**
 *
 * @param rootValueKey
 * @param data
 * @param mode
 */
function getMatchReducer(rootValueKey: string, data: DataType, mode: UserInterfaceProps["mode"]): MatchReducer {
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

    const rawToken = match[0]
    const dataType = match.groups && (match.groups.dataType as CoerceableDataType)
    const token = match.groups && match.groups.token
    const format = match.groups && match.groups.format // ex.: P2
    const key = getKeyFromToken(token, rootValueKey)

    if (!isNull(key) && mode !== "edit") {
      const defaultValue = rawToken.replace("$", `$${rootValueKey}`)
      const rawValue = key.length > 0 ? get(key, data) : data

      /*
       * Simple value replacement and stop processing this stringTemplate
       * (No coercion to a formatted string)
       * rawTokens can be:
       * {$}
       * {$.propertyName}
       * {$.propertyName.subPropertyName}
       */
      if (match[0] === acc && isEmpty(dataType) && isEmpty(format)) {
        return !isNull(key) && !isEmpty(key) ? get(key, data) : data
      }

      /*
       * Coerce the value to a formatted string
       */
      const formattedValue = formatValue(rawValue, format, dataType)
      const value = !isNull(formattedValue) ? formattedValue : defaultValue
      acc = !isNull(formattedValue) ? acc.replace(rawToken, value) : acc.replace(rawToken, defaultValue)
    } else {
      // Cannot replace this token, so leave it as we found it
      acc = acc.replace(rawToken, `{$${rootValueKey}}`)
    }
    return acc
  }
}

/**
 *
 * @param token
 * @param rootValueKey
 */
function getKeyFromToken(token: undefined | string, rootValueKey: string): string {
  let tokenKey
  if (!token) {
    tokenKey = null
  } else if (token === "$") {
    tokenKey = ""
  } else {
    // Trim the leading $.
    tokenKey = token.slice(2, token.length) || null
  }

  const keyPathParts = []
  if (!isEmpty(rootValueKey) && rootValueKey !== "$") {
    keyPathParts.push(rootValueKey)
  }
  if (!isEmpty(tokenKey)) {
    keyPathParts.push(tokenKey)
  }
  return keyPathParts.join(".")
}
