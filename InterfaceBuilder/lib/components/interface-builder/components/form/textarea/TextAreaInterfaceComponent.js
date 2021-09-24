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
var text_area_manage_form_1 = require("./text-area-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var CharCounter_1 = __importDefault(require("../_shared/CharCounter"));
function getAutosize(minRows, maxRows, autosize) {
    var minMaxRows = minRows || maxRows ? { minRows: minRows, maxRows: maxRows } : undefined;
    return typeof autosize !== "undefined" && autosize ? true : minMaxRows;
}
function getValue(valueKey, userInterfaceData, defaultValue) {
    var rawValue = fp_1.get(valueKey, userInterfaceData);
    return typeof rawValue !== "undefined" ? rawValue : defaultValue;
}
var TextAreaInterfaceComponent = /** @class */ (function (_super) {
    __extends(TextAreaInterfaceComponent, _super);
    function TextAreaInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (_a) {
            var value = _a.target.value;
            var _b = _this.props, onChangeData = _b.onChangeData, userInterfaceData = _b.userInterfaceData, valueKey = _b.valueKey;
            onChangeData && onChangeData(fp_1.set(valueKey, value, userInterfaceData));
        };
        return _this;
    }
    TextAreaInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "textarea",
            title: "Text Area",
            icon: "edit",
            formControl: true,
            componentDefinition: {
                component: "textarea",
                label: "Text Area",
            },
        };
    };
    TextAreaInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, autosize = _a.autosize, minRows = _a.minRows, maxRows = _a.maxRows, maxLength = _a.maxLength;
        var value = getValue(valueKey, userInterfaceData, defaultValue);
        var autosizeValue = getAutosize(minRows, maxRows, autosize);
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(antd_1.Input.TextArea, { onChange: this.handleChange, value: value, autosize: autosizeValue, maxLength: maxLength }),
            react_1.default.createElement(CharCounter_1.default, { text: value, maxLength: maxLength })));
    };
    TextAreaInterfaceComponent.defaultProps = {
        valueKey: "value",
        defaultValue: "",
        placeholder: "Enter text",
    };
    TextAreaInterfaceComponent.manageForm = text_area_manage_form_1.textAreaManageForm;
    return TextAreaInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.TextAreaInterfaceComponent = TextAreaInterfaceComponent;
//# sourceMappingURL=TextAreaInterfaceComponent.js.map