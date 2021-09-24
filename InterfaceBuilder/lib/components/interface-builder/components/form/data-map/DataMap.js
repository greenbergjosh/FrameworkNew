"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var react_1 = __importDefault(require("react"));
var itemChangeHandler = function (data, index, onDataChanged) { return function (updatedItem) {
    return onDataChanged(__spread(data.slice(0, index), [updatedItem], data.slice(index + 1)));
}; };
var itemDeleteHandler = function (data, index, onDataChanged) { return function () { return onDataChanged(__spread(data.slice(0, index), data.slice(index + 1))); }; };
var rowProps = {
    gutter: 16,
};
var colProps = {
    span: 10,
};
var deleteColumnProps = {
    span: 4,
};
exports.DataMap = function (_a) {
    var count = _a.count, data = _a.data, keyLabel = _a.keyLabel, onDataChanged = _a.onDataChanged, multiple = _a.multiple, renderKeyComponent = _a.renderKeyComponent, renderValueComponent = _a.renderValueComponent, valueLabel = _a.valueLabel;
    var headerRow = (react_1.default.createElement(antd_1.Row, __assign({ key: "header" }, rowProps),
        react_1.default.createElement(antd_1.Col, __assign({}, colProps), keyLabel),
        react_1.default.createElement(antd_1.Col, __assign({}, colProps), valueLabel)));
    var hasCount = typeof count === "number";
    var iterable = hasCount ? __spread(data) : multiple || data.length === 0 ? __spread(data, [{}]) : data;
    if (typeof count === "number") {
        while (iterable.length < count) {
            iterable.push({});
        }
    }
    var items = iterable.map(function (dataItem, index) { return (react_1.default.createElement(antd_1.Row, __assign({ key: index }, rowProps),
        react_1.default.createElement(antd_1.Col, __assign({}, colProps), renderKeyComponent(dataItem, itemChangeHandler(data, index, onDataChanged))),
        react_1.default.createElement(antd_1.Col, __assign({}, colProps), renderValueComponent(dataItem, itemChangeHandler(data, index, onDataChanged))),
        !hasCount && (react_1.default.createElement(antd_1.Col, __assign({}, deleteColumnProps), index < data.length && (react_1.default.createElement(antd_1.Button, { style: { padding: 1 }, icon: "close", onClick: itemDeleteHandler(data, index, onDataChanged), type: "danger" })))))); });
    return (react_1.default.createElement(react_1.default.Fragment, null,
        headerRow,
        items));
};
exports.DataMap.defaultProps = {
    data: [],
    keyLabel: "key",
    valueLabel: "value",
};
//# sourceMappingURL=DataMap.js.map