"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var react_1 = __importDefault(require("react"));
var getLength = function (value) {
    return typeof value !== "undefined" && value.length ? value.length : 0;
};
var CharCounter = function (_a) {
    var text = _a.text, maxLength = _a.maxLength, className = _a.className;
    if (!maxLength)
        return null;
    return (react_1.default.createElement(antd_1.Typography.Text, { type: "secondary", className: className, style: {
            display: "block",
            textAlign: "right",
            fontSize: "0.85em",
            lineHeight: "12px",
        } },
        getLength(text),
        "/",
        maxLength));
};
exports.default = CharCounter;
//# sourceMappingURL=CharCounter.js.map