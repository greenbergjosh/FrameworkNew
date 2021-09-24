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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var DataMap_1 = require("../data-map/DataMap");
var DataPathContext_1 = require("../../../util/DataPathContext");
var ComponentRenderer_1 = require("../../../ComponentRenderer");
var data_dictionary_manage_form_1 = require("./data-dictionary-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var DataDictionaryInterfaceComponent = /** @class */ (function (_super) {
    __extends(DataDictionaryInterfaceComponent, _super);
    function DataDictionaryInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataDictionaryInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "data-dictionary",
            title: "Data Dictionary",
            icon: "book",
            formControl: true,
            componentDefinition: {
                component: "data-dictionary",
            },
        };
    };
    DataDictionaryInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, keyLabel = _a.keyLabel, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueComponent = _a.valueComponent, valueKey = _a.valueKey;
        var dictionary = fp_1.get(valueKey, userInterfaceData) || defaultValue;
        var values = dictionary && Object.entries(dictionary).map(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return ({ key: key, value: value });
        });
        return (react_1.default.createElement(DataMap_1.DataMap, { data: values, keyLabel: keyLabel, multiple: true, onDataChanged: function (newData) {
                var newValue = newData.reduce(function (acc, item) {
                    acc[item.key] = typeof item.value === "undefined" ? null : item.value;
                    return acc;
                }, {});
                onChangeData && onChangeData(fp_1.set(valueKey, newValue, userInterfaceData));
            }, renderKeyComponent: function (dataItem, onChangeData) {
                return (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "keyComponent" },
                    react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { componentLimit: 1, components: [
                            {
                                key: "dataDictionaryKey",
                                component: "input",
                                valueKey: "key",
                                hideLabel: true,
                            },
                        ], data: dataItem, mode: "display", onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                            console.warn("DataDictionaryInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in DataDictionary", { newSchema: newSchema });
                        } })));
            }, renderValueComponent: function (dataItem, onChangeData) {
                return (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "valueComponent" },
                    react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { componentLimit: 1, components: valueComponent
                            ? valueComponent.map(function (component) { return (__assign(__assign({}, component), { valueKey: "value", hideLabel: true })); })
                            : [], data: dataItem, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                            console.warn("DataDictionaryInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in DataDictionary", { newSchema: newSchema });
                        } })));
            }, valueLabel: Array.isArray(valueComponent) && valueComponent.length ? valueComponent[0].label : "" }));
    };
    DataDictionaryInterfaceComponent.defaultProps = {
        keyLabel: "Key",
        valueComponent: [
            {
                hideLabel: false,
                label: "Label",
                component: "input",
                valueKey: "value",
            },
        ],
        valueKey: "data",
    };
    DataDictionaryInterfaceComponent.manageForm = data_dictionary_manage_form_1.dataDictionaryManageForm;
    return DataDictionaryInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.DataDictionaryInterfaceComponent = DataDictionaryInterfaceComponent;
//# sourceMappingURL=DataDictionaryInterfaceComponent.js.map