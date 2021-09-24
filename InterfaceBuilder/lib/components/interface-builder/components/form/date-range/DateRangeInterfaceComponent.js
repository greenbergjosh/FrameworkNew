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
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator]
    if (!m) return o
    var i = m.call(o),
      r,
      ar = [],
      e
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value)
    } catch (error) {
      e = { error: error }
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i)
      } finally {
        if (e) throw e.error
      }
    }
    return ar
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
var antd_1 = require("antd")
var fp_1 = require("lodash/fp")
var moment_1 = __importDefault(require("moment"))
var react_1 = __importDefault(require("react"))
var common_include_time_form_1 = require("../_shared/common-include-time-form")
var date_range_manage_form_1 = require("./date-range-manage-form")
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent")
var DateRangeInterfaceComponent = /** @class */ (function (_super) {
  __extends(DateRangeInterfaceComponent, _super)
  function DateRangeInterfaceComponent() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this
    _this.handleChange = function (dates, dateStrings) {
      var _a = _this.props,
        endDateKey = _a.endDateKey,
        startDateKey = _a.startDateKey,
        onChangeData = _a.onChangeData,
        timeSettings = _a.timeSettings,
        userInterfaceData = _a.userInterfaceData
      var includeTime = (timeSettings || { includeTime: false }).includeTime
      var alignmentTimePeriod =
        timeSettings && includeTime
          ? timeSettings.includeSecond
            ? "second"
            : timeSettings.includeMinute
            ? "minute"
            : timeSettings.includeHour
            ? "hour"
            : "day"
          : "day"
      var startDate = Array.isArray(dates) && dates[0] ? dates[0].startOf(alignmentTimePeriod).toISOString() : null
      var endDate = Array.isArray(dates) && dates[1] ? dates[1].endOf(alignmentTimePeriod).toISOString() : null
      onChangeData && onChangeData(fp_1.set(startDateKey, startDate, fp_1.set(endDateKey, endDate, userInterfaceData)))
    }
    _this.getDefaultValue = function () {
      return DateRangeInterfaceComponent.getDefintionDefaultValue(_this.props)
    }
    _this.getValues = function () {
      var _a = _this.props,
        endDateKey = _a.endDateKey,
        startDateKey = _a.startDateKey,
        userInterfaceData = _a.userInterfaceData
      return [fp_1.get(startDateKey, userInterfaceData), fp_1.get(endDateKey, userInterfaceData)]
    }
    return _this
  }
  DateRangeInterfaceComponent.getLayoutDefinition = function () {
    return {
      category: "Form",
      name: "date-range",
      title: "Date Range",
      icon: "calendar",
      formControl: true,
      componentDefinition: {
        component: "date-range",
        label: "Date Range",
      },
    }
  }
  DateRangeInterfaceComponent.getDefinitionDefaultValue = function (_a) {
    var defaultRangeValue = _a.defaultRangeValue,
      endDateKey = _a.endDateKey,
      startDateKey = _a.startDateKey
    var _b = __read(this.standardRanges()[defaultRangeValue], 2),
      startDate = _b[0],
      endDate = _b[1]
    return fp_1.set(startDateKey, startDate.toISOString(), fp_1.set(endDateKey, endDate.toISOString(), {}))
  }
  DateRangeInterfaceComponent.standardRanges = function () {
    var now = moment_1.default.utc()
    return {
      Today: [now.clone().startOf("day"), now.clone().endOf("day")],
      Yesterday: [now.clone().subtract(1, "day").startOf("day"), now.clone().subtract(1, "day").endOf("day")],
      "This Week": [now.clone().startOf("week").startOf("day"), now.clone().endOf("week").endOf("day")],
      "Last Week": [
        now.clone().subtract(1, "week").startOf("week").startOf("day"),
        now.clone().subtract(1, "week").endOf("week").endOf("day"),
      ],
      "This Month": [now.clone().startOf("month").startOf("day"), now.clone().endOf("month").endOf("day")],
      "Last Month": [
        now.clone().subtract(1, "month").startOf("month").startOf("day"),
        now.clone().subtract(1, "month").endOf("month").endOf("day"),
      ],
      YTD: [now.clone().startOf("year").startOf("day"), now.clone().endOf("day")],
    }
  }
  DateRangeInterfaceComponent.prototype.render = function () {
    var timeSettings = this.props.timeSettings
    var _a = __read(this.getValues(), 2),
      startDateValue = _a[0],
      endDateValue = _a[1]
    var timeFormat = common_include_time_form_1.getTimeFormat(timeSettings)
    return react_1.default.createElement(antd_1.DatePicker.RangePicker, {
      format: "YYYY-MM-DD" + (timeFormat ? " " + timeFormat.format : ""),
      onChange: this.handleChange,
      ranges: DateRangeInterfaceComponent.standardRanges(),
      showTime: timeFormat,
      style: { display: "block" },
      value: [moment_1.default.utc(startDateValue || undefined), moment_1.default.utc(endDateValue || undefined)],
    })
  }
  DateRangeInterfaceComponent.defaultProps = {
    startDateKey: "startDate",
    endDateKey: "endDate",
  }
  DateRangeInterfaceComponent.manageForm = date_range_manage_form_1.dateRangeManageForm
  return DateRangeInterfaceComponent
})(BaseInterfaceComponent_1.BaseInterfaceComponent)
exports.DateRangeInterfaceComponent = DateRangeInterfaceComponent
//# sourceMappingURL=DateRangeInterfaceComponent.js.map
