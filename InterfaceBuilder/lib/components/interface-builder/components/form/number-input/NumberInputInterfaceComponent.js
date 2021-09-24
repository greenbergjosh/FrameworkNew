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
var number_input_manage_form_1 = require("./number-input-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var NumberInputInterfaceComponent = /** @class */ (function (_super) {
    __extends(NumberInputInterfaceComponent, _super);
    function NumberInputInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (value) {
            var _a = _this.props, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            onChangeData && onChangeData(fp_1.set(valueKey, value, userInterfaceData));
        };
        return _this;
    }
    NumberInputInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "number-input",
            title: "Number Input",
            icon: "number",
            formControl: true,
            componentDefinition: {
                component: "number-input",
                label: "Number",
            },
        };
    };
    NumberInputInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        var rawValue = fp_1.get(valueKey, userInterfaceData);
        var value = typeof rawValue !== "undefined" ? rawValue : defaultValue;
        return react_1.default.createElement(antd_1.InputNumber, { onChange: this.handleChange, value: value });
    };
    NumberInputInterfaceComponent.defaultProps = {
        valueKey: "value",
        defaultValue: "",
        placeholder: "Enter text",
    };
    NumberInputInterfaceComponent.manageForm = number_input_manage_form_1.numberInputManageForm;
    return NumberInputInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.NumberInputInterfaceComponent = NumberInputInterfaceComponent;
//# sourceMappingURL=NumberInputInterfaceComponent.js.map