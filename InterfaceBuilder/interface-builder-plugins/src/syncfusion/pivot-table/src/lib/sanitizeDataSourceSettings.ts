import {
  AuthenticationModel,
  CalculatedFieldSettingsModel,
  ConditionalFormatSettingsModel,
  DataSourceSettingsModel,
  DrillOptionsModel,
  FieldOptionsModel,
  FilterModel,
  FormatSettingsModel,
  GroupSettingsModel,
  SortModel,
  ValueSortSettingsModel,
} from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"
import * as modelKeys from "./constants"
import { cloneDeep } from "lodash/fp"
import { JSONRecord } from "@opg/interface-builder"

/**
 * Provide default values and remove properties that are not part of each model.
 * The provided "settings" parameter may contain additional unwanted properties
 * and methods; especially when it is of type EnginePopulatedEventArgs.IDataOptions
 * in an event handler.
 * @param settings
 */
export function sanitizeDataSourceSettings(settings?: DataSourceSettingsModel): DataSourceSettingsModel {
  const settingsCopy = settings ? cloneDeep(settings) : {}
  return {
    //
    // Datasource props
    catalog: settingsCopy.catalog || "",
    cube: settingsCopy.cube || "",
    localeIdentifier: settingsCopy.localeIdentifier || 1033,
    providerType: settingsCopy.providerType || "SSAS",
    url: settingsCopy.url || "",
    //
    // Other props
    allowLabelFilter: settingsCopy.allowLabelFilter || false,
    allowMemberFilter: settingsCopy.allowMemberFilter || true,
    allowValueFilter: settingsCopy.allowValueFilter || false,
    alwaysShowValueHeader: settingsCopy.alwaysShowValueHeader || false,
    authentication: sanitizeObject<AuthenticationModel>("AuthenticationModel", settingsCopy.authentication) || {},
    calculatedFieldSettings:
      sanitizeArray<CalculatedFieldSettingsModel>(
        "CalculatedFieldSettingsModel",
        settingsCopy.calculatedFieldSettings
      ) || [],
    columns: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", settingsCopy.columns) || [],
    conditionalFormatSettings:
      sanitizeArray<ConditionalFormatSettingsModel>(
        "ConditionalFormatSettingsModel",
        settingsCopy.conditionalFormatSettings
      ) || [],
    drilledMembers: sanitizeArray<DrillOptionsModel>("DrillOptionsModel", settingsCopy.drilledMembers) || [],
    enableSorting: settingsCopy.enableSorting || false,
    excludeFields: settingsCopy.excludeFields || [],
    expandAll: settingsCopy.expandAll || false,
    fieldMapping: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", settingsCopy.fieldMapping) || [],
    filters: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", settingsCopy.filters) || [],
    filterSettings: sanitizeArray<FilterModel>("FilterModel", settingsCopy.filterSettings) || [],
    formatSettings: sanitizeArray<FormatSettingsModel>("FormatSettingsModel", settingsCopy.formatSettings) || [],
    groupSettings: sanitizeArray<GroupSettingsModel>("GroupSettingsModel", settingsCopy.groupSettings) || [],
    rows: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", settingsCopy.rows) || [],
    showAggregationOnValueField: settingsCopy.showAggregationOnValueField || true,
    showColumnGrandTotals: settingsCopy.showColumnGrandTotals || true,
    showColumnSubTotals: settingsCopy.showColumnSubTotals || true,
    showGrandTotals: settingsCopy.showGrandTotals || true,
    showHeaderWhenEmpty: settingsCopy.showHeaderWhenEmpty || true,
    showRowGrandTotals: settingsCopy.showRowGrandTotals || true,
    showRowSubTotals: settingsCopy.showRowSubTotals || true,
    showSubTotals: settingsCopy.showSubTotals || true,
    sortSettings: sanitizeArray<SortModel>("SortModel", settingsCopy.sortSettings) || [],
    valueAxis: settingsCopy.valueAxis || "column",
    values: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", settingsCopy.values) || [],
    valueSortSettings: sanitizeObject<ValueSortSettingsModel>(
      "ValueSortSettingsModel",
      settingsCopy.valueSortSettings
    ) || {
      headerDelimiter: ".",
      sortOrder: "None",
    },
  }
}

/**
 * Remove properties that are not part of the model from each object in the array.
 * @param typename
 * @param dirtyArray
 */
function sanitizeArray<T>(typename: string, dirtyArray?: T[]) {
  if (!dirtyArray) return
  const cleanArray: T[] = []
  dirtyArray.forEach((obj) => {
    const newObj = sanitizeObject<T>(typename, obj)
    cleanArray.push(newObj as unknown as T)
  })
  return cleanArray
}

/**
 * Remove properties that are not part of the model.
 * @param typename
 * @param dirtyObject
 */
function sanitizeObject<T>(typename: string, dirtyObject?: T) {
  if (!dirtyObject) return
  const cleanObject: JSONRecord = {}
  const keys = getModelKeys(typename)

  keys.forEach((key) => {
    const jsonObj = dirtyObject as unknown as JSONRecord
    cleanObject[key] = jsonObj[key]
  })

  return cleanObject as unknown as T
}

/**
 *
 * @param typename
 */
function getModelKeys(typename: string): string[] {
  switch (typename) {
    case "AuthenticationModel":
      return modelKeys.AuthenticationModelKeys
    case "CalculatedFieldSettingsModel":
      return modelKeys.CalculatedFieldSettingsModelKeys
    case "ConditionalFormatSettingsModel":
      return modelKeys.ConditionalFormatSettingsModelKeys
    case "DataSourceSettingsModel":
      return modelKeys.DataSourceSettingsModelKeys
    case "DrillOptionsModel":
      return modelKeys.DrillOptionsModelKeys
    case "FieldOptionsModel":
      return modelKeys.FieldOptionsModelKeys
    case "FilterModel":
      return modelKeys.FilterModelKeys
    case "FormatSettingsModel":
      return modelKeys.FormatSettingsModelKeys
    case "GroupSettingsModel":
      return modelKeys.GroupSettingsModelKeys
    case "SortModel":
      return modelKeys.SortModelKeys
    case "ValueSortSettingsModel":
      return modelKeys.ValueSortSettingsModelKeys
  }
  return []
}
