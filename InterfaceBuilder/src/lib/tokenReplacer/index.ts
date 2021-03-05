import { get, isNull } from "lodash/fp"
import { formatValue } from "lib/valueFormatter"
import { MatchReducer } from "./types"
import { CoerceableDataType, DataType } from "lib/valueFormatter/types"

/*
 * Test cases
 * https://regex101.com/r/vfVPMl/1
 */
const regex = /\{(?<type>date|number)?\(?(?<key>\$\.?[^(){}:]*)\)?:?(?<format>[CcDdEeFfGgMmNnOoPpRrsTtUuXxYy]\d{0,2})?}/gm

/**
 *
 * @param stringTemplate
 * @param data
 * @param rootValueKey
 */
export function replaceTokens(stringTemplate: string, data: DataType, rootValueKey: string): string {
  const matchReducer = getMatchReducer(rootValueKey, data)
  let match: RegExpExecArray | null
  let finalText: string | null = stringTemplate

  while ((match = regex.exec(stringTemplate)) !== null) {
    // Avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }
    finalText = matchReducer(finalText, match)
  }
  return finalText || stringTemplate
}

/**
 *
 * @param stringTemplate
 */
export function hasTokens(stringTemplate: string): boolean {
  return stringTemplate.search(regex) > -1
}

/**
 * token can be:
 * "$"
 * "$.propertyName"
 *
 * @param token
 */
function getKeyFromToken(token: string | undefined): string | null {
  if (!token) return null
  if (token === "$") return ""
  // Trim the leading $.
  return token.slice(2, token.length) || null
}

/**
 *
 * @param rootValueKey
 * @param data
 */
function getMatchReducer(rootValueKey: string, data: DataType): MatchReducer {
  /**
   * rawToken can be:
   * {$}
   * {$:XNN}
   * {dataType($)}
   * {dataType($):XNN}
   * {$.propertyName}
   * {$.propertyName:XNN}
   * {dataType($.propertyName)}
   * {dataType($.propertyName):XNN}
   */
  return (acc: string, matchAry: string[]): string => {
    const match = matchAry as RegExpExecArray
    if (!match) {
      return acc
    }

    const rawToken = match[0]
    const dataType = match.groups && (match.groups.type as CoerceableDataType)
    const token = match.groups && match.groups.key
    const rawFormat = match.groups && match.groups.format // ex.: P2
    const key = getKeyFromToken(token)

    if (!isNull(key)) {
      const defaultValue = rawToken.replace("$", `$${rootValueKey}`)
      const rawValue = key.length > 0 ? get(key, data) : data
      const formattedValue = formatValue(rawValue, rawFormat, dataType)
      const value = !isNull(formattedValue) ? formattedValue : defaultValue
      acc = !isNull(formattedValue) ? acc.replace(rawToken, value) : acc.replace(rawToken, defaultValue)
    } else {
      acc = acc.replace(rawToken, `{$${rootValueKey}`)
    }
    return acc
  }
}
