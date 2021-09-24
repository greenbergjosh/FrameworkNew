"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var PrivatePathContext = react_1.default.createContext("");
exports.DataPathContext = function (_a) {
    var path = _a.path, reset = _a.reset, children = _a.children;
    var currentPath = react_1.default.useContext(PrivatePathContext);
    var content = typeof children === "function" ? (react_1.default.createElement(PrivatePathContext.Consumer, null, children)) : (children);
    return reset || ["string", "number"].includes(typeof path) ? (react_1.default.createElement(PrivatePathContext.Provider, { value: reset ? "" : "" + (currentPath ? currentPath + "." : "") + path }, content)) : (content);
};
//# sourceMappingURL=DataPathContext.js.map