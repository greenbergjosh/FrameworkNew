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
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var UserInterfaceContextManager_1 = require("../../../UserInterfaceContextManager");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var Selectable = /** @class */ (function (_super) {
    __extends(Selectable, _super);
    // static manageForm = selectManageForm
    function Selectable(props) {
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
        /**
         *
         * @param values
         */
        _this.updateOptionsFromValues = function (values) {
            var labelKey = "label";
            var valueKey = "value";
            var valueSet = new Set();
            _this.setState({
                options: values
                    .filter(function (value) {
                    var stringValue = String(fp_1.get(valueKey, value));
                    if (!valueSet.has(stringValue)) {
                        valueSet.add(stringValue);
                        return true;
                    }
                    return false;
                })
                    .map(function (value, index) { return ({
                    label: fp_1.get(labelKey, value) || "Option " + (index + 1),
                    value: String(fp_1.get(valueKey, value)),
                }); }),
                loadStatus: "loaded",
            });
        };
        /**
         *
         */
        _this.getCleanValue = function () {
            var _a = _this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, valuePrefix = _a.valuePrefix, valueSuffix = _a.valueSuffix;
            var options = _this.state.options;
            var rawValue = typeof fp_1.get(valueKey, userInterfaceData) !== "undefined"
                ? fp_1.get(valueKey, userInterfaceData)
                : defaultValue;
            var anyCaseResult = rawValue &&
                (Array.isArray(rawValue)
                    ? rawValue.map(function (value) { return cleanText(value, valuePrefix, valueSuffix); } //.toLowerCase()
                    )
                    : cleanText(rawValue, valuePrefix, valueSuffix)); //.toLowerCase()
            // console.log("Selectable.getCleanValue", { anyCaseResult, options })
            if (!Array.isArray(anyCaseResult)) {
                return (options &&
                    (options.find(function (_a) {
                        var value = _a.value;
                        return value === anyCaseResult ||
                            (typeof value === "string" && value.toLowerCase()) ===
                                (anyCaseResult && anyCaseResult.toLowerCase());
                    }) || { value: anyCaseResult }).value);
            }
            return options
                ? anyCaseResult.map(function (resultItem) {
                    return (options.find(function (_a) {
                        var value = _a.value;
                        return value === resultItem ||
                            (typeof value === "string" && value.toLowerCase()) ===
                                (resultItem && resultItem.toLowerCase());
                    }) || { value: resultItem }).value;
                })
                : anyCaseResult;
        };
        _this.state = {
            loadError: null,
            loadStatus: "none",
            options: [],
        };
        return _this;
    }
    Selectable.getDerivedStateFromProps = function (props, state) {
        // console.log(
        //   "Selectable.getDerivedStateFromProps",
        //   state.loadStatus,
        //   props.dataHandlerType,
        //   props.data
        // )
        if (props.dataHandlerType === "local" &&
            Selectable.optionsDidChange(props.data && props.data.values, state.options)) {
            return {
                options: (props.data && props.data.values) || [],
                loadStatus: "loaded",
            };
        }
        return null;
    };
    Selectable.optionsDidChange = function (values, options) {
        var intersection = fp_1.intersectionWith(fp_1.isEqual, values, options);
        return intersection.length !== values.length || values.length !== options.length;
    };
    Selectable.prototype.render = function () {
        var _a = this.props, allowCreateNew = _a.allowCreateNew, createNewLabel = _a.createNewLabel, disabled = _a.disabled;
        var _b = this.state, loadStatus = _b.loadStatus, options = _b.options, loadError = _b.loadError;
        var selectableChildProps = {
            allowCreateNew: allowCreateNew,
            createNewLabel: createNewLabel,
            disabled: disabled,
            options: options,
            getCleanValue: this.getCleanValue,
            loadStatus: loadStatus,
            loadError: loadError,
        };
        return react_1.default.createElement(react_1.default.Fragment, null, this.props.children && this.props.children(selectableChildProps));
    };
    Selectable.defaultProps = {
        createNewLabel: "Create New...",
        defaultValue: undefined,
        valueKey: "value",
        valuePrefix: "",
        valueSuffix: "",
    };
    /*static getLayoutDefinition() {
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
      }
    }*/
    Selectable.contextType = UserInterfaceContextManager_1.UserInterfaceContext;
    return Selectable;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.Selectable = Selectable;
var cleanText = function (text, prefix, suffix) {
    var noPrefix = text && prefix && text.startsWith(prefix) ? text.substring(prefix.length) : text;
    var noSuffix = noPrefix && suffix && noPrefix.endsWith(suffix)
        ? noPrefix.substr(0, noPrefix.length - suffix.length)
        : noPrefix;
    return noSuffix;
};
//# sourceMappingURL=Selectable.js.map