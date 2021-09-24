"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var fp_1 = require("lodash/fp");
var moment_1 = __importDefault(require("moment"));
var react_1 = __importDefault(require("react"));
var common_include_time_form_1 = require("../_shared/common-include-time-form");
var date_manage_form_1 = require("./date-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var DateInterfaceComponent = /** @class */ (function (_super) {
    __extends(DateInterfaceComponent, _super);
    function DateInterfaceComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (inputMoment, dateString) {
            var _a = _this.props, onChangeData = _a.onChangeData, timeSettings = _a.timeSettings, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            var timeFormat = common_include_time_form_1.getTimeFormat(timeSettings);
            var newValueMoment = moment_1.default(dateString, "YYYY-MM-DD" + (timeFormat ? " " + timeFormat.format : ""));
            var currentValue = fp_1.get(valueKey, userInterfaceData);
            var includeTime = (timeSettings || { includeTime: false }).includeTime;
            var alignmentTimePeriod = timeSettings && includeTime
                ? timeSettings.includeSecond
                    ? "second"
                    : timeSettings.includeMinute
                        ? "minute"
                        : timeSettings.includeHour
                            ? "hour"
                            : "day"
                : "day";
            var newValue = newValueMoment.isValid()
                ? newValueMoment
                    .startOf(alignmentTimePeriod)
                    .utc()
                    .toISOString()
                : null;
            if (currentValue !== newValue && onChangeData) {
                console.log("DateInterfaceComponent", { inputMoment: inputMoment, dateString: dateString, newValueMoment: newValueMoment });
                onChangeData(fp_1.set(valueKey, newValue, userInterfaceData));
            }
        };
        return _this;
    }
    DateInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "date",
            title: "Date",
            icon: "calendar",
            formControl: true,
            componentDefinition: {
                component: "date",
                label: "Date",
            },
        };
    };
    DateInterfaceComponent.prototype.render = function () {
        var _a = this.props, timeSettings = _a.timeSettings, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        var value = fp_1.get(valueKey, userInterfaceData);
        var timeFormat = common_include_time_form_1.getTimeFormat(timeSettings);
        return (react_1.default.createElement(antd_1.DatePicker, { format: "YYYY-MM-DD" + (timeFormat ? " " + timeFormat.format : ""), onChange: this.handleChange, showTime: timeFormat, style: { display: "block" }, value: moment_1.default.utc(value || undefined).local() }));
    };
    DateInterfaceComponent.defaultProps = {
        valueKey: "date",
    };
    DateInterfaceComponent.manageForm = date_manage_form_1.dateManageForm;
    return DateInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.DateInterfaceComponent = DateInterfaceComponent;
//# sourceMappingURL=DateInterfaceComponent.js.map