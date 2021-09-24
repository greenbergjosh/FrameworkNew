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
var bulk_text_input_manage_form_1 = require("./bulk-text-input-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var codec_1 = require("./codec");
function getAutosize(minRows, maxRows, autosize) {
    var minMaxRows = minRows || maxRows ? { minRows: minRows, maxRows: maxRows } : undefined;
    return typeof autosize !== "undefined" && autosize ? true : minMaxRows;
}
function getValue(valueKey, userInterfaceData, defaultValue, codec) {
    var rawValue = fp_1.get(valueKey, userInterfaceData);
    var value = codec.join(rawValue);
    return typeof value !== "undefined" ? value : defaultValue;
}
var BulkTextInputInterfaceComponent = /** @class */ (function (_super) {
    __extends(BulkTextInputInterfaceComponent, _super);
    function BulkTextInputInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (_a) {
            var value = _a.target.value;
            var _b = _this.props, onChangeData = _b.onChangeData, userInterfaceData = _b.userInterfaceData, valueKey = _b.valueKey, itemSeparator = _b.itemSeparator;
            var codec = codec_1.getCodec(itemSeparator);
            var arrayValue = codec.split(value);
            onChangeData && onChangeData(fp_1.set(valueKey, arrayValue, userInterfaceData));
        };
        return _this;
    }
    BulkTextInputInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "bulk-text-input",
            title: "Bulk Text Input",
            icon: "copy",
            formControl: true,
            componentDefinition: {
                component: "bulk-text-input",
                label: "Bulk Text Input",
            },
        };
    };
    BulkTextInputInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, autosize = _a.autosize, minRows = _a.minRows, maxRows = _a.maxRows, itemSeparator = _a.itemSeparator, newlinePlaceholder = _a.newlinePlaceholder, commaPlaceholder = _a.commaPlaceholder;
        var codec = codec_1.getCodec(itemSeparator);
        var value = getValue(valueKey, userInterfaceData, defaultValue, codec);
        var autosizeValue = getAutosize(minRows, maxRows, autosize);
        var placeholder = itemSeparator === codec_1.separator.comma ? commaPlaceholder : newlinePlaceholder;
        return (react_1.default.createElement(antd_1.Input.TextArea, { onChange: this.handleChange, value: value, autosize: autosizeValue, placeholder: placeholder }));
    };
    BulkTextInputInterfaceComponent.defaultProps = {
        valueKey: "value",
        defaultValue: "",
        placeholder: "Enter text",
    };
    BulkTextInputInterfaceComponent.manageForm = bulk_text_input_manage_form_1.bulkTextInputManageForm;
    return BulkTextInputInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.BulkTextInputInterfaceComponent = BulkTextInputInterfaceComponent;
//# sourceMappingURL=BulkTextInputInterfaceComponent.js.map