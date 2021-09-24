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
var checkbox_manage_form_1 = require("./checkbox-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var CheckboxInterfaceComponent = /** @class */ (function (_super) {
    __extends(CheckboxInterfaceComponent, _super);
    function CheckboxInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (_a) {
            var checked = _a.target.checked;
            var _b = _this.props, onChangeData = _b.onChangeData, userInterfaceData = _b.userInterfaceData, valueKey = _b.valueKey;
            onChangeData && onChangeData(fp_1.set(valueKey, checked, userInterfaceData));
        };
        var defaultValue = props.defaultValue, userInterfaceData = props.userInterfaceData, valueKey = props.valueKey;
        _this.state = { value: fp_1.get(valueKey, userInterfaceData) || defaultValue || false };
        return _this;
    }
    CheckboxInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "checkbox",
            title: "Checkbox",
            icon: "check-square",
            formControl: true,
            componentDefinition: {
                component: "checkbox",
                label: "Checkbox",
            },
        };
    };
    CheckboxInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        var rawValue = fp_1.get(valueKey, userInterfaceData);
        var value = typeof rawValue === "boolean" ? rawValue : defaultValue;
        return react_1.default.createElement(antd_1.Checkbox, { onChange: this.handleChange, checked: value });
    };
    CheckboxInterfaceComponent.defaultProps = {
        valueKey: "value",
        defaultValue: true,
    };
    CheckboxInterfaceComponent.manageForm = checkbox_manage_form_1.checkboxManageForm;
    return CheckboxInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.CheckboxInterfaceComponent = CheckboxInterfaceComponent;
//# sourceMappingURL=CheckboxInterfaceComponent.js.map