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
var input_manage_form_1 = require("./input-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var CharCounter_1 = __importDefault(require("../_shared/CharCounter"));
var input_scss_1 = __importDefault(require("./input.scss"));
var InputInterfaceComponent = /** @class */ (function (_super) {
    __extends(InputInterfaceComponent, _super);
    function InputInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (_a) {
            var value = _a.target.value;
            var _b = _this.props, onChangeData = _b.onChangeData, userInterfaceData = _b.userInterfaceData, valueKey = _b.valueKey;
            onChangeData && onChangeData(fp_1.set(valueKey, value, userInterfaceData));
        };
        return _this;
    }
    InputInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "input",
            title: "Text Input",
            icon: "edit",
            formControl: true,
            componentDefinition: {
                component: "input",
                label: "Text",
            },
        };
    };
    InputInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, maxLength = _a.maxLength;
        var rawValue = fp_1.get(valueKey, userInterfaceData);
        var value = typeof rawValue !== "undefined" ? rawValue : defaultValue;
        return (react_1.default.createElement("div", { className: input_scss_1.default.wrapper },
            react_1.default.createElement(antd_1.Input, { onChange: this.handleChange, value: value, maxLength: maxLength, className: input_scss_1.default.input }),
            react_1.default.createElement(CharCounter_1.default, { text: value, maxLength: maxLength, className: input_scss_1.default.counter })));
    };
    InputInterfaceComponent.defaultProps = {
        valueKey: "value",
        defaultValue: "",
        placeholder: "Enter text",
    };
    InputInterfaceComponent.manageForm = input_manage_form_1.inputManageForm;
    return InputInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.InputInterfaceComponent = InputInterfaceComponent;
//# sourceMappingURL=InputInterfaceComponent.js.map