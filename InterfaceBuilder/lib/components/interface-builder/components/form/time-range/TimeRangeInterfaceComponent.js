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
var react_1 = __importDefault(require("react"))
var antd_1 = require("antd")
var fp_1 = require("lodash/fp")
var moment_1 = __importDefault(require("moment"))
var time_range_manage_form_1 = require("./time-range-manage-form")
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent")
var TIMEFORMAT = "h:mm a"
var TimeRangeInterfaceComponent = /** @class */ (function (_super) {
  __extends(TimeRangeInterfaceComponent, _super)
  function TimeRangeInterfaceComponent(props) {
    var _this = _super.call(this, props) || this
    _this.handleStartTimeChange = function (time, timeString) {
      _this.setUIDataByKey(time, _this.props.startTimeKey)
    }
    _this.handleEndTimeChange = function (time, timeString) {
      _this.setUIDataByKey(time, _this.props.endTimeKey)
    }
    _this.getValue = function (timeKey) {
      var userInterfaceData = _this.props.userInterfaceData
      var timeValue = fp_1.get(timeKey, userInterfaceData)
      return typeof timeValue !== "undefined" ? moment_1.default.utc(timeValue, TIMEFORMAT) : undefined
    }
    _this.getDefaultValue = function () {
      return moment_1.default("00:00:00", "HH:mm:ss")
    }
    return _this
  }
  TimeRangeInterfaceComponent.getLayoutDefinition = function () {
    return {
      category: "Form",
      name: "time-range",
      title: "Time Range",
      icon: "clock-circle",
      formControl: true,
      componentDefinition: {
        component: "time-range",
        label: "Time Range",
      },
    }
  }
  TimeRangeInterfaceComponent.getDefinitionDefaultValue = function (_a) {
    var endTimeKey = _a.endTimeKey,
      startTimeKey = _a.startTimeKey
    var startTime = moment_1.default.utc()
    var endTime = startTime
    return fp_1.set(startTimeKey, startTime.toISOString(), fp_1.set(endTimeKey, endTime.toISOString(), {}))
  }
  TimeRangeInterfaceComponent.prototype.setUIDataByKey = function (time, timeKey) {
    var _a = this.props,
      onChangeData = _a.onChangeData,
      userInterfaceData = _a.userInterfaceData
    var timeValue = time ? time.format("LT") : undefined
    onChangeData && onChangeData(fp_1.set(timeKey, timeValue, userInterfaceData))
  }
  TimeRangeInterfaceComponent.prototype.render = function () {
    var _a = this.props,
      size = _a.size,
      endTimePlaceholder = _a.endTimePlaceholder,
      startTimePlaceholder = _a.startTimePlaceholder,
      startTimeKey = _a.startTimeKey,
      endTimeKey = _a.endTimeKey
    return react_1.default.createElement(
      react_1.default.Fragment,
      null,
      react_1.default.createElement(antd_1.TimePicker, {
        value: this.getValue(startTimeKey),
        placeholder: startTimePlaceholder,
        format: TIMEFORMAT,
        onChange: this.handleStartTimeChange,
        defaultOpenValue: this.getDefaultValue(),
        size: size,
        use12Hours: true,
      }),
      react_1.default.createElement("span", null, "\u00A0to\u00A0"),
      react_1.default.createElement(antd_1.TimePicker, {
        value: this.getValue(endTimeKey),
        placeholder: endTimePlaceholder,
        format: TIMEFORMAT,
        onChange: this.handleEndTimeChange,
        defaultOpenValue: this.getDefaultValue(),
        size: size,
        use12Hours: true,
      })
    )
  }
  TimeRangeInterfaceComponent.defaultProps = {
    startTimeKey: "startTime",
    endTimeKey: "endTime",
  }
  TimeRangeInterfaceComponent.manageForm = time_range_manage_form_1.timeRangeManageForm
  return TimeRangeInterfaceComponent
})(BaseInterfaceComponent_1.BaseInterfaceComponent)
exports.TimeRangeInterfaceComponent = TimeRangeInterfaceComponent
//# sourceMappingURL=TimeRangeInterfaceComponent.js.map
