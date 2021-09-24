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
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var DataMap_1 = require("./DataMap");
var DataPathContext_1 = require("../../../util/DataPathContext");
var ComponentRenderer_1 = require("../../../ComponentRenderer");
var data_map_manage_form_1 = require("./data-map-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var DataMapInterfaceComponent = /** @class */ (function (_super) {
    __extends(DataMapInterfaceComponent, _super);
    function DataMapInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataMapInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "data-map",
            title: "Data Map",
            icon: "appstore",
            formControl: true,
            componentDefinition: {
                component: "data-map",
                label: "Data Map",
            },
        };
    };
    DataMapInterfaceComponent.prototype.render = function () {
        var _a = this.props, count = _a.count, defaultValue = _a.defaultValue, keyComponent = _a.keyComponent, multiple = _a.multiple, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueComponent = _a.valueComponent, valueKey = _a.valueKey;
        var values = fp_1.get(valueKey, userInterfaceData) || defaultValue;
        return (react_1.default.createElement(DataMap_1.DataMap, { count: count, data: values, keyLabel: keyComponent.label, onDataChanged: function (newData) {
                return (console.log("DataMapInterfaceComponent.onDataChanged", {
                    valueKey: valueKey,
                    newData: newData,
                    userInterfaceData: userInterfaceData,
                    result: fp_1.set(valueKey, newData, userInterfaceData),
                }),
                    0) ||
                    (onChangeData && onChangeData(fp_1.set(valueKey, newData, userInterfaceData)));
            }, multiple: multiple, renderKeyComponent: function (dataItem, onChangeData) {
                return (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "keyComponent" },
                    react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { componentLimit: 1, components: [__assign(__assign({}, keyComponent), { hideLabel: true })], data: dataItem, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                            console.warn("DataMapInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in DataMap", { newSchema: newSchema });
                        } })));
            }, renderValueComponent: function (dataItem, onChangeData) {
                return (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "valueComponent" },
                    react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { componentLimit: 1, components: [__assign(__assign({}, valueComponent), { hideLabel: true })], data: dataItem, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                            console.warn("DataMapInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in DataMap", { newSchema: newSchema });
                        } })));
            }, valueLabel: valueComponent.label }));
    };
    DataMapInterfaceComponent.defaultProps = {
        keyComponent: {
            hideLabel: false,
            label: "Value",
            component: "input",
            valueKey: "key",
        },
        multiple: true,
        valueComponent: {
            hideLabel: false,
            label: "Label",
            component: "input",
            valueKey: "value",
        },
        valueKey: "data",
    };
    DataMapInterfaceComponent.manageForm = data_map_manage_form_1.dataMapManageForm;
    return DataMapInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.DataMapInterfaceComponent = DataMapInterfaceComponent;
//# sourceMappingURL=DataMapInterfaceComponent.js.map