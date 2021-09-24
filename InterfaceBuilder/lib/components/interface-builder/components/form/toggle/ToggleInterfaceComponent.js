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
var toggle_manage_form_1 = require("./toggle-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var ToggleInterfaceComponent = /** @class */ (function (_super) {
    __extends(ToggleInterfaceComponent, _super);
    function ToggleInterfaceComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (checked) {
            var _a = _this.props, inverted = _a.inverted, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            onChangeData && onChangeData(fp_1.set(valueKey, inverted ? !checked : checked, userInterfaceData));
        };
        return _this;
    }
    ToggleInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "toggle",
            title: "Toggle",
            icon: "login",
            formControl: true,
            componentDefinition: {
                component: "toggle",
                label: "Toggle",
            },
        };
    };
    ToggleInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, inverted = _a.inverted, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        var rawValue = fp_1.get(valueKey, userInterfaceData);
        var realValue = (typeof rawValue !== "undefined" ? rawValue : defaultValue) || false;
        var finalValue = inverted ? !realValue : realValue;
        return react_1.default.createElement(antd_1.Switch, { onChange: this.handleChange, checked: finalValue });
    };
    ToggleInterfaceComponent.defaultProps = {
        valueKey: "value",
    };
    ToggleInterfaceComponent.manageForm = toggle_manage_form_1.toggleManageForm;
    return ToggleInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.ToggleInterfaceComponent = ToggleInterfaceComponent;
//# sourceMappingURL=ToggleInterfaceComponent.js.map