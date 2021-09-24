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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var react_1 = __importDefault(require("react"));
var RenderInterfaceComponent_1 = require("../RenderInterfaceComponent");
exports.ManageComponentPreview = function (_a) {
    var Component = _a.Component, componentDefinition = _a.componentDefinition, layoutDefinition = _a.layoutDefinition;
    var _b = __read(react_1.default.useState({}), 2), previewData = _b[0], setPreviewData = _b[1];
    var renderedComponent = (react_1.default.createElement(RenderInterfaceComponent_1.RenderInterfaceComponent, { Component: Component, componentDefinition: __assign(__assign({}, componentDefinition), { _preview: true }), data: previewData, index: 0, mode: "display", onChangeData: setPreviewData, path: "PREVIEW" }));
    return layoutDefinition.formControl ? react_1.default.createElement(antd_1.Form, null, renderedComponent) : renderedComponent;
};
//# sourceMappingURL=ManageComponentPreview.js.map