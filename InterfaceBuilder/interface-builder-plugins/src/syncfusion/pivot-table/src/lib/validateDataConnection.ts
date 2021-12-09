import { isEmpty, isNumber } from "lodash/fp"
import { DataSourceSettingsModel } from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"

export function validateDataConnection(datasource: DataSourceSettingsModel): boolean {
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
