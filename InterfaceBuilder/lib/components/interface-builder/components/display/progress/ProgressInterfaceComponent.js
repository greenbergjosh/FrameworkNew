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
var react_1 = __importDefault(require("react"));
var progress_manage_form_1 = require("./progress-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var STATUS = {
    success: "success",
    exception: "exception",
    normal: "normal",
    active: "active",
};
var SIZE = {
    default: "default",
    small: "small",
};
var ProgressInterfaceComponent = /** @class */ (function (_super) {
    __extends(ProgressInterfaceComponent, _super);
    function ProgressInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProgressInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "progress",
            title: "Progress",
            icon: "loading-3-quarters",
            componentDefinition: {
                component: "progress",
            },
        };
    };
    ProgressInterfaceComponent.prototype.render = function () {
        var _a = this.props, calculatePercent = _a.calculatePercent, defaultValue = _a.defaultValue, forceStatus = _a.forceStatus, hideInfo = _a.hideInfo, maxValueKey = _a.maxValueKey, smallLine = _a.smallLine, statusKey = _a.statusKey, statuses = _a.statuses, successPercent = _a.successPercent, type = _a.type, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, width = _a.width;
        // Determine Status
        var statusValue = statusKey && fp_1.get(statusKey, userInterfaceData);
        var status = forceStatus === "useAPI" ? mapStatus(statuses || STATUS, statusValue) : forceStatus;
        // Determine Value
        var rawValue = fp_1.get(valueKey, userInterfaceData);
        var value = typeof rawValue !== "undefined" ? rawValue : defaultValue;
        var percent = value;
        var format;
        // Calculate percent, if necessary
        if (calculatePercent) {
            var rawTotal = fp_1.get(maxValueKey, userInterfaceData);
            var total_1 = typeof rawTotal !== "undefined" ? rawTotal : defaultValue;
            percent = Math.round((value / total_1) * 100);
            format = function () { return value + "/" + total_1; };
        }
        return (react_1.default.createElement(antd_1.Progress, { format: format, percent: percent, showInfo: !hideInfo, size: smallLine ? SIZE.small : SIZE.default, status: status, successPercent: successPercent, type: type, width: width }));
    };
    ProgressInterfaceComponent.defaultProps = {
        defaultValue: 0,
    };
    ProgressInterfaceComponent.manageForm = progress_manage_form_1.progressManageForm;
    return ProgressInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.ProgressInterfaceComponent = ProgressInterfaceComponent;
var mapStatus = function (statuses, statusValue) {
    console.log("Progress", statuses, statusValue);
    switch (statusValue) {
        case statuses.success:
            return STATUS.success;
        case statuses.exception:
            return STATUS.exception;
        case statuses.active:
            return STATUS.active;
        default:
            return STATUS.normal;
    }
};
//# sourceMappingURL=ProgressInterfaceComponent.js.map