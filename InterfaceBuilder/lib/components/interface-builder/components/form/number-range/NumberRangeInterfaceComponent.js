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
var number_range_manage_form_1 = require("./number-range-manage-form")
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent")
var NumberRangeInterfaceComponent = /** @class */ (function (_super) {
  __extends(NumberRangeInterfaceComponent, _super)
  function NumberRangeInterfaceComponent() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this
    _this.handleChange = function (value) {
      var _a = _this.props,
        endKey = _a.endKey,
        startKey = _a.startKey,
        onChangeData = _a.onChangeData,
        userInterfaceData = _a.userInterfaceData
      if (Array.isArray(value)) {
        onChangeData && onChangeData(fp_1.set(startKey, value[0], fp_1.set(endKey, value[1], userInterfaceData)))
      }
    }
    _this.getDefaultValue = function () {
      return NumberRangeInterfaceComponent.getDefintionDefaultValue(_this.props)
    }
    _this.getValues = function () {
      var _a = _this.props,
        endKey = _a.endKey,
        startKey = _a.startKey,
        userInterfaceData = _a.userInterfaceData
      return [fp_1.get(startKey, userInterfaceData), fp_1.get(endKey, userInterfaceData)]
    }
    return _this
  }
  NumberRangeInterfaceComponent.getLayoutDefinition = function () {
    return {
      category: "Form",
      name: "number-range",
      title: "Number Range",
      icon: "control",
      formControl: true,
      componentDefinition: {
        component: "number-range",
        label: "Number Range",
      },
    }
  }
  NumberRangeInterfaceComponent.getDefinitionDefaultValue = function (_a) {
    var defaultRangeValueType = _a.defaultRangeValueType,
      defaultRangeLowerValue = _a.defaultRangeLowerValue,
      defaultRangeUpperValue = _a.defaultRangeUpperValue,
      lowerBound = _a.lowerBound,
      upperBound = _a.upperBound,
      endKey = _a.endKey,
      startKey = _a.startKey
    console.log("NumberRangeInterfaceComponent.getDefaultValue", {
      defaultRangeValueType: defaultRangeValueType,
      defaultRangeLowerValue: defaultRangeLowerValue,
      defaultRangeUpperValue: defaultRangeUpperValue,
      lowerBound: lowerBound,
      upperBound: upperBound,
      endKey: endKey,
      startKey: startKey,
    })
    if (defaultRangeValueType !== "none") {
      var lowerValue = void 0,
        upperValue = void 0
      if (defaultRangeValueType === "full") {
        lowerValue = lowerBound
        upperValue = upperBound
      } else if (defaultRangeValueType === "partial") {
        lowerValue = defaultRangeLowerValue
        upperBound = defaultRangeUpperValue
      }
      return fp_1.set(startKey, lowerValue, fp_1.set(endKey, upperValue, {}))
    }
    return {}
  }
  NumberRangeInterfaceComponent.prototype.render = function () {
    var _a = this.props,
      lowerBound = _a.lowerBound,
      marks = _a.marks,
      orientation = _a.orientation,
      upperBound = _a.upperBound
    return react_1.default.createElement(antd_1.Slider, {
      defaultValue: this.getValues(),
      marks: convertMarks(marks),
      max: upperBound,
      min: lowerBound,
      onChange: this.handleChange,
      range: true,
      vertical: orientation === "vertical",
    })
  }
  NumberRangeInterfaceComponent.defaultProps = {
    startKey: "start",
    endKey: "end",
    orientation: "horizontal",
  }
  NumberRangeInterfaceComponent.manageForm = number_range_manage_form_1.numberRangeManageForm
  return NumberRangeInterfaceComponent
})(BaseInterfaceComponent_1.BaseInterfaceComponent)
exports.NumberRangeInterfaceComponent = NumberRangeInterfaceComponent
var convertMarks = function (marks) {
  return (marks || []).reduce(function (acc, _a) {
    var label = _a.label,
      value = _a.value
    return typeof value !== "undefined" ? fp_1.set(value, { label: label }, acc) : acc
  }, {})
}
//# sourceMappingURL=NumberRangeInterfaceComponent.js.map
