/**
 * SYNCFUSION MODEL PROPERTY KEYS
 *
 * These are the keys that should be on each model. We use these to pick off
 * only the model values from objects that contain additional properties and methods.
 *
 * WARNING
 * I couldn't find an automated way to get string[] of model keys.
 * So here I am brute force copying them. Obviously these interfaces might
 * change in future versions and break this code. BUT... since any persisted
 * settings data will use these properties, it would be better to map any changed
 * properties and only add new ones.
 *
 * Copied from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"
 */

export const AuthenticationModelKeys = ["userName", "password"]

export const CalculatedFieldSettingsModelKeys = ["name", "formula", "hierarchyUniqueName", "formatString"]

export const ConditionalFormatSettingsModelKeys = [
  "applyGrandTotals",
  "conditions",
  "label",
  "measure",
  "style",
  "value1",
  "value2",
]

export const DataSourceSettingsModelKeys = [
  "allowLabelFilter",
  "allowMemberFilter",
  "allowValueFilter",
  "alwaysShowValueHeader",
  "authentication",
  "calculatedFieldSettings",
  "catalog",
  "columns",
  "conditionalFormatSettings",
  "cube",
  "dataSource",
  "drilledMembers",
  "emptyCellsTextContent",
  "enableSorting",
  "excludeFields",
  "expandAll",
  "fieldMapping",
  "filters",
  "filterSettings",
  "formatSettings",
  "groupSettings",
  "localeIdentifier",
  "mode",
  "providerType",
  "rows",
  "showAggregationOnValueField",
  "showColumnGrandTotals",
  "showColumnSubTotals",
  "showGrandTotals",
  "showHeaderWhenEmpty",
  "showRowGrandTotals",
  "showRowSubTotals",
  "showSubTotals",
  "sortSettings",
  "type",
  "url",
  "valueAxis",
  "valueIndex",
  "values",
  "valueSortSettings",
]

export const DrillOptionsModelKeys = ["name", "items", "delimiter"]

export const FieldOptionsModelKeys = [
  "allowDragAndDrop",
  "axis",
  "baseField",
  "baseItem",
  "caption",
  "dataType",
  "isCalculatedField",
  "isNamedSet",
  "name",
  "showEditIcon",
  "showFilterIcon",
  "showNoDataItems",
  "showRemoveIcon",
  "showSortIcon",
  "showSubTotals",
  "showValueTypeIcon",
  "type",
]

export const FilterModelKeys = [
  "condition",
  "items",
  "levelCount",
  "measure",
  "name",
  "selectedField",
  "type",
  "value1",
  "value2",
]

export const FormatSettingsModelKeys = [
  "applyGrandTotals",
  "conditions",
  "label",
  "measure",
  "style",
  "value1",
  "value2",
]

export const GroupSettingsModelKeys = [
  "caption",
  "customGroups",
  "endingAt",
  "groupInterval",
  "name",
  "rangeInterval",
  "startingAt",
  "type",
]

export const SortModelKeys = ["name", "order"]

export const ValueSortSettingsModelKeys = ["headerText", "headerDelimiter", "sortOrder", "measure"]
