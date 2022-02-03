import { isEmpty, isNumber } from "lodash/fp"
import { DataSource } from "types"

export function validateDataConnection(datasource: DataSource): boolean {
  return (
    validateUrl(datasource.url) &&
    validateString(datasource.cube) &&
    validateString(datasource.catalog) &&
    validateString(datasource.providerType) &&
    validateNumber(datasource.localeIdentifier)
  )
}

function validateUrl(url?: string): boolean {
  if (!url) {
    return false
  }
  return validateString(url) && url.length > 7
}

function validateString(prop?: string): boolean {
  return prop ? !isEmpty(prop) : false
}

function validateNumber(prop?: number): boolean {
  return prop ? isNumber(prop) : false
}
