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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var fp_1 = require("lodash/fp");
var antd_1 = require("antd");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var selectable_1 = require("../../_shared/selectable");
var select_manage_form_1 = require("./select-manage-form");
exports.MODES = {
    default: "default",
    multiple: "multiple",
    tags: "tags",
};
/******************************
 * Component
 */
var SelectInterfaceComponent = /** @class */ (function (_super) {
    __extends(SelectInterfaceComponent, _super);
    function SelectInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (value) {
            var _a = _this.props, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, valuePrefix = _a.valuePrefix, valueSuffix = _a.valueSuffix;
            var newValue = valuePrefix || valueSuffix
                ? Array.isArray(value)
                    ? value.map(function (v) { return "" + valuePrefix + v + valueSuffix; })
                    : "" + valuePrefix + value + valueSuffix
                : value;
            onChangeData && onChangeData(fp_1.set(valueKey, newValue, userInterfaceData));
        };
        _this.filterOption = function (input, option) {
            // When switching about the internals of component during configuration time, the type of children can change
            if (typeof option.props.children.toLowerCase === "function" &&
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
                return true;
            }
            else if (Array.isArray(option.props.children)) {
                return !!option.props.children.find(function (item) {
                    if (item &&
                        typeof item.toLowerCase === "function" &&
                        item.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
                        return true;
                    }
                });
            }
            return false;
        };
        /****************************************************************
         * Define this component's render for Selectable to call
         * so Selectable can pass in Selectable state and props.
         * Props must implement SelectableChildProps interface.
         */
        _this.renderSelect = function (_a) {
            var allowCreateNew = _a.allowCreateNew, createNewLabel = _a.createNewLabel, disabled = _a.disabled, getCleanValue = _a.getCleanValue, loadError = _a.loadError, loadStatus = _a.loadStatus, options = _a.options;
            var _b = _this.props, placeholder = _b.placeholder, allowClear = _b.allowClear, multiple = _b.multiple;
            var getKeyFromValue = function () {
                var value = getCleanValue();
                return value && value.toString();
            };
            return (react_1.default.createElement(antd_1.Select, { allowClear: allowClear, defaultValue: getCleanValue(), disabled: disabled, filterOption: _this.filterOption, key: getKeyFromValue(), loading: loadStatus === "loading", mode: _this.mode, onChange: _this.handleChange, optionFilterProp: "label", placeholder: placeholder, showSearch: true },
                options.map(function (option) { return (react_1.default.createElement(antd_1.Select.Option, { key: "" + option.value, value: option.value },
                    typeof option.icon !== "undefined" ? (react_1.default.createElement(antd_1.Icon, { type: option.icon, style: { marginRight: "8px" } })) : null,
                    option.label)); }),
                allowCreateNew && (react_1.default.createElement(antd_1.Select.Option, { key: "create_new_entry", value: "create_new" }, createNewLabel))));
        };
        return _this;
    }
    SelectInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "select",
            title: "Select",
            icon: "bars",
            formControl: true,
            componentDefinition: {
                component: "select",
                label: "Select",
            },
        };
    };
    Object.defineProperty(SelectInterfaceComponent.prototype, "mode", {
        get: function () {
            return this.props.multiple ? exports.MODES.multiple : exports.MODES.default;
        },
        enumerable: true,
        configurable: true
    });
    SelectInterfaceComponent.prototype.render = function () {
        return (
        // Since props is a union of ISelectProps and SelectableProps, we cast as SelectableProps
        react_1.default.createElement(selectable_1.Selectable, __assign({}, this.props), this.renderSelect));
    };
    SelectInterfaceComponent.defaultProps = {
        allowClear: true,
        createNewLabel: "Create New...",
        defaultValue: undefined,
        multiple: false,
        placeholder: "Choose one",
        valueKey: "value",
        valuePrefix: "",
        valueSuffix: "",
    };
    SelectInterfaceComponent.manageForm = select_manage_form_1.selectManageForm;
    return SelectInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.SelectInterfaceComponent = SelectInterfaceComponent;
//# sourceMappingURL=SelectInterfaceComponent.js.map