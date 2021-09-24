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
var password_manage_form_1 = require("./password-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var PasswordInterfaceComponent = /** @class */ (function (_super) {
    __extends(PasswordInterfaceComponent, _super);
    function PasswordInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (_a) {
            var value = _a.target.value;
            var _b = _this.props, onChangeData = _b.onChangeData, userInterfaceData = _b.userInterfaceData, valueKey = _b.valueKey;
            onChangeData && onChangeData(fp_1.set(valueKey, value, userInterfaceData));
        };
        return _this;
    }
    PasswordInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "password",
            title: "Password",
            icon: "lock",
            formControl: true,
            componentDefinition: {
                component: "password",
                label: "Password",
            },
        };
    };
    PasswordInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, hasShowPasswordToggle = _a.hasShowPasswordToggle;
        var rawValue = fp_1.get(valueKey, userInterfaceData);
        var value = typeof rawValue !== "undefined" ? rawValue : defaultValue;
        return react_1.default.createElement(antd_1.Input.Password, { onChange: this.handleChange, value: value, visibilityToggle: hasShowPasswordToggle });
    };
    PasswordInterfaceComponent.defaultProps = {
        valueKey: "value",
        defaultValue: "",
        placeholder: "Enter password",
    };
    PasswordInterfaceComponent.manageForm = password_manage_form_1.passwordManageForm;
    return PasswordInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.PasswordInterfaceComponent = PasswordInterfaceComponent;
//# sourceMappingURL=PasswordInterfaceComponent.js.map