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
  "measure",
  "label",
  "conditions",
  "value1",
  "value2",
  "style",
  "applyGrandTotals",
]

export const DataSourceSettingsModelKeys = [
  "mode",
  "catalog",
  "cube",
  "providerType",
  "url",
  "localeIdentifier",
  "dataSource",
  "rows",
  "columns",
  "values",
  "filters",
  "fieldMapping",
  "excludeFields",
  "expandAll",
  "valueAxis",
  "valueIndex",
  "filterSettings",
  "sortSettings",
  "enableSorting",
  "type",
  "allowMemberFilter",
  "allowLabelFilter",
  "allowValueFilter",
  "showSubTotals",
  "showRowSubTotals",
  "showColumnSubTotals",
  "showGrandTotals",
  "showRowGrandTotals",
  "showColumnGrandTotals",
  "alwaysShowValueHeader",
  "showHeaderWhenEmpty",
  "showAggregationOnValueField",
  "formatSettings",
  "drilledMembers",
  "valueSortSettings",
  "calculatedFieldSettings",
  "conditionalFormatSettings",
  "emptyCellsTextContent",
  "groupSettings",
  "authentication",
]

export const DrillOptionsModelKeys = ["name", "items", "delimiter"]

export const FieldOptionsModelKeys = [
  "name",
  "caption",
  "type",
  "axis",
  "showNoDataItems",
  "baseField",
  "baseItem",
  "showSubTotals",
  "isNamedSet",
  "isCalculatedField",
  "showFilterIcon",
  "showSortIcon",
  "showRemoveIcon",
  "showValueTypeIcon",
  "showEditIcon",
  "allowDragAndDrop",
  "dataType",
]

export const FilterModelKeys = [
  "name",
  "type",
  "items",
  "condition",
  "value1",
  "value2",
  "measure",
  "levelCount",
  "selectedField",
]

export const FormatSettingsModelKeys = [
  "measure",
  "label",
  "conditions",
  "value1",
  "value2",
  "style",
  "applyGrandTotals",
]

export const GroupSettingsModelKeys = [
  "name",
  "groupInterval",
  "startingAt",
  "endingAt",
  "type",
  "rangeInterval",
  "caption",
  "customGroups",
]

export const SortModelKeys = ["name", "order"]

export const ValueSortSettingsModelKeys = ["headerText", "headerDelimiter", "sortOrder", "measure"]
