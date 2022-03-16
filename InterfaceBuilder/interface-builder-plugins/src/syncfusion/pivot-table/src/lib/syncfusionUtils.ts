import {
  AuthenticationModel,
  CalculatedFieldSettingsModel,
  ConditionalFormatSettingsModel,
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
import { DataSource, ViewDataSource } from "types"
import { IDataOptions } from "@syncfusion/ej2-pivotview"

/**
 * Convert Syncfusion's IDataOptions to ViewDataSource.
 * IDataOptions uses getters on most properties, so dataOptions can't be directly cast to ViewDataSource.
 * @param dataOptions
 */
export function dataOptionsToViewDataSource(dataOptions: IDataOptions): ViewDataSource {
  return {
    //
    // Datasource props
    catalog: dataOptions.catalog,
    cube: dataOptions.cube,
    dataSource: dataOptions.dataSource,
    localeIdentifier: dataOptions.localeIdentifier,
    providerType: dataOptions.providerType,
    url: dataOptions.url,
    //
    // Other props
    allowLabelFilter: dataOptions.allowLabelFilter,
    allowMemberFilter: dataOptions.allowMemberFilter,
    allowValueFilter: dataOptions.allowValueFilter,
    alwaysShowValueHeader: dataOptions.alwaysShowValueHeader,
    authentication: dataOptions.authentication,
    calculatedFieldSettings: dataOptions.calculatedFieldSettings,
    columns: dataOptions.columns,
    conditionalFormatSettings: dataOptions.conditionalFormatSettings,
    drilledMembers: dataOptions.drilledMembers,
    emptyCellsTextContent: dataOptions.emptyCellsTextContent,
    enableSorting: dataOptions.enableSorting,
    excludeFields: dataOptions.excludeFields || [],
    expandAll: false,
    fieldMapping: dataOptions.fieldMapping,
    filters: dataOptions.filters,
    filterSettings: dataOptions.filterSettings,
    formatSettings: dataOptions.formatSettings,
    groupSettings: dataOptions.groupSettings,
    rows: dataOptions.rows,
    showAggregationOnValueField: dataOptions.showAggregationOnValueField,
    showColumnGrandTotals: dataOptions.showColumnGrandTotals,
    showColumnSubTotals: dataOptions.showColumnSubTotals,
    showGrandTotals: dataOptions.showGrandTotals,
    showHeaderWhenEmpty: dataOptions.showHeaderWhenEmpty,
    showRowGrandTotals: dataOptions.showRowGrandTotals,
    showRowSubTotals: dataOptions.showRowSubTotals,
    showSubTotals: dataOptions.showSubTotals,
    sortSettings: dataOptions.sortSettings,
    type: dataOptions.type,
    valueAxis: dataOptions.valueAxis,
    valueIndex: dataOptions.valueIndex,
    values: dataOptions.values,
    valueSortSettings: dataOptions.valueSortSettings,
    source: "view",
  }
}

/**
 * Returns a sanitized deep copy of the data source.
 * Provide default values and remove properties that are not part of each model.
 * The provided "settings" parameter may contain additional unwanted properties
 * and methods; especially when it is of type EnginePopulatedEventArgs.IDataOptions
 * in an event handler.
 * @param dataSource
 */
export function sanitizeDataSource<T extends DataSource>(dataSource: T): T {
  const dataSourceClone = dataSource && cloneDeep(dataSource)
  return {
    //
    // Datasource props
    catalog: dataSourceClone.catalog || "",
    cube: dataSourceClone.cube || "",
    dataSource: dataSourceClone.dataSource,
    localeIdentifier: dataSourceClone.localeIdentifier || 1033,
    mode: dataSourceClone.mode,
    providerType: dataSourceClone.providerType || "SSAS",
    url: dataSourceClone.url || "",
    //
    // Other props
    allowLabelFilter: dataSourceClone.allowLabelFilter || false,
    allowMemberFilter: dataSourceClone.allowMemberFilter || true,
    allowValueFilter: dataSourceClone.allowValueFilter || false,
    alwaysShowValueHeader: dataSourceClone.alwaysShowValueHeader || false,
    authentication: sanitizeObject<AuthenticationModel>("AuthenticationModel", dataSourceClone.authentication) || {},
    calculatedFieldSettings:
      sanitizeArray<CalculatedFieldSettingsModel>(
        "CalculatedFieldSettingsModel",
        dataSourceClone.calculatedFieldSettings
      ) || [],
    columns: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", dataSourceClone.columns) || [],
    conditionalFormatSettings:
      sanitizeArray<ConditionalFormatSettingsModel>(
        "ConditionalFormatSettingsModel",
        dataSourceClone.conditionalFormatSettings
      ) || [],
    drilledMembers: sanitizeArray<DrillOptionsModel>("DrillOptionsModel", dataSourceClone.drilledMembers) || [],
    emptyCellsTextContent: dataSourceClone.emptyCellsTextContent || null,
    enableSorting: dataSourceClone.enableSorting || false,
    excludeFields: dataSourceClone.excludeFields || [],
    expandAll: false,
    fieldMapping: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", dataSourceClone.fieldMapping) || [],
    filters: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", dataSourceClone.filters) || [],
    filterSettings: sanitizeArray<FilterModel>("FilterModel", dataSourceClone.filterSettings) || [],
    formatSettings: sanitizeArray<FormatSettingsModel>("FormatSettingsModel", dataSourceClone.formatSettings) || [],
    groupSettings: sanitizeArray<GroupSettingsModel>("GroupSettingsModel", dataSourceClone.groupSettings) || [],
    rows: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", dataSourceClone.rows) || [],
    showAggregationOnValueField: dataSourceClone.showAggregationOnValueField || true,
    showColumnGrandTotals: dataSourceClone.showColumnGrandTotals || true,
    showColumnSubTotals: dataSourceClone.showColumnSubTotals || true,
    showGrandTotals: dataSourceClone.showGrandTotals || true,
    showHeaderWhenEmpty: dataSourceClone.showHeaderWhenEmpty || true,
    showRowGrandTotals: dataSourceClone.showRowGrandTotals || true,
    showRowSubTotals: dataSourceClone.showRowSubTotals || true,
    showSubTotals: dataSourceClone.showSubTotals || true,
    sortSettings: sanitizeArray<SortModel>("SortModel", dataSourceClone.sortSettings) || [],
    type: dataSourceClone.type,
    valueAxis: dataSourceClone.valueAxis || "column",
    valueIndex: dataSourceClone.valueIndex,
    values: sanitizeArray<FieldOptionsModel>("FieldOptionsModel", dataSourceClone.values) || [],
    valueSortSettings: sanitizeObject<ValueSortSettingsModel>(
      "ValueSortSettingsModel",
      dataSourceClone.valueSortSettings
    ) || {
      headerDelimiter: ".",
      sortOrder: "None",
    },
    source: dataSourceClone.source,
  } as T
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
