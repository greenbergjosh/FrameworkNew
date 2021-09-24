"use strict"
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
        }
      return extendStatics(d, b)
    }
    return function (d, b) {
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
var antd_1 = require("antd")
var fp_1 = require("lodash/fp")
var react_1 = __importDefault(require("react"))
var DataPathContext_1 = require("../../../util/DataPathContext")
var ComponentRenderer_1 = require("../../../ComponentRenderer")
var column_manage_form_1 = require("./column-manage-form")
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent")
var ColumnInterfaceComponent = /** @class */ (function (_super) {
  __extends(ColumnInterfaceComponent, _super)
  function ColumnInterfaceComponent() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this
    _this.getDefaultValue = function () {
      return ColumnInterfaceComponent.getDefintionDefaultValue(_this.props)
    }
    return _this
  }
  ColumnInterfaceComponent.getLayoutDefinition = function () {
    return {
      category: "Display",
      name: "column",
      title: "Columns",
      icon: "project",
      componentDefinition: {
        component: "column",
        components: [],
      },
    }
  }
  ColumnInterfaceComponent.getDefinitionDefaultValue = function (_a) {
    var columns = _a.columns
    return (columns || []).reduce(function (acc, column) {
      return fp_1.merge(acc, BaseInterfaceComponent_1.getDefaultsFromComponentDefinitions(column.components))
    }, {})
  }
  ColumnInterfaceComponent.prototype.render = function () {
    var _a = this.props,
      columns = _a.columns,
      gutter = _a.gutter,
      onChangeData = _a.onChangeData,
      userInterfaceData = _a.userInterfaceData
    var definedColumnWidths = columns.reduce(
      function (acc, _a) {
        var span = _a.span
        return span && !isNaN(Number(String(span))) ? { sum: acc.sum + span, count: acc.count + 1 } : acc
      },
      { sum: 0, count: 0 }
    )
    var colSpan = Math.floor((24 - definedColumnWidths.sum) / (columns.length - definedColumnWidths.count || 1))
    return react_1.default.createElement(
      DataPathContext_1.DataPathContext,
      { path: "columns" },
      react_1.default.createElement(
        antd_1.Row,
        { type: "flex", justify: "space-between", gutter: gutter },
        columns.map(function (_a, columnIndex) {
          var components = _a.components,
            hideTitle = _a.hideTitle,
            span = _a.span,
            title = _a.title
          return react_1.default.createElement(
            DataPathContext_1.DataPathContext,
            { path: "" + columnIndex, key: columnIndex },
            react_1.default.createElement(
              antd_1.Col,
              { span: span || colSpan },
              hideTitle !== true && title ? react_1.default.createElement("div", null, title) : null,
              react_1.default.createElement(
                DataPathContext_1.DataPathContext,
                { path: "components" },
                react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, {
                  components: components,
                  data: userInterfaceData,
                  onChangeData: onChangeData,
                  onChangeSchema: function (newSchema) {
                    console.warn(
                      "ColumnInterfaceComponent.render",
                      "TODO: Cannot alter schema inside ComponentRenderer in Column",
                      { newSchema: newSchema }
                    )
                  },
                })
              )
            )
          )
        })
      )
    )
  }
  ColumnInterfaceComponent.defaultProps = {
    addItemLabel: "Add Item",
    columns: [],
    gutter: 8,
    userInterfaceData: {},
    valueKey: "data",
  }
  ColumnInterfaceComponent.manageForm = column_manage_form_1.columnManageForm
  return ColumnInterfaceComponent
})(BaseInterfaceComponent_1.BaseInterfaceComponent)
exports.ColumnInterfaceComponent = ColumnInterfaceComponent
//# sourceMappingURL=ColumnInterfaceComponent.js.map
