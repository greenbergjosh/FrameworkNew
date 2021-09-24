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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
function ConfirmableDeleteButton(_a) {
    var confirmationMessage = _a.confirmationMessage, confirmationTitle = _a.confirmationTitle, onDelete = _a.onDelete, props = __rest(_a, ["confirmationMessage", "confirmationTitle", "onDelete"]);
    var _b = __read(react_1.default.useState(false), 2), isShowingConfirmation = _b[0], setIsShowingConfirmation = _b[1];
    var toggleConfirmation = react_1.default.useCallback(function () {
        setIsShowingConfirmation(!isShowingConfirmation);
    }, [isShowingConfirmation]);
    return (react_1.default.createElement(antd_1.Popover, { content: getPopoverContent(), placement: "topRight", title: getPopoverTitle(), trigger: "click", visible: isShowingConfirmation, onVisibleChange: setIsShowingConfirmation },
        react_1.default.createElement(antd_1.Button, __assign({ icon: "delete", title: "Delete", type: "danger" }, props))));
    function getPopoverContent() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(antd_1.Typography.Paragraph, null, confirmationMessage),
            react_1.default.createElement(antd_1.Row, null,
                react_1.default.createElement(antd_1.Col, { span: 12 },
                    react_1.default.createElement(antd_1.Button, { block: true, onClick: toggleConfirmation }, "Cancel")),
                react_1.default.createElement(antd_1.Col, { span: 12 },
                    react_1.default.createElement(antd_1.Button, { block: true, type: "danger", onClick: onDelete }, "Delete")))));
    }
    function getPopoverTitle() {
        return (confirmationTitle && (react_1.default.createElement(antd_1.Typography.Text, { strong: true },
            react_1.default.createElement(antd_1.Icon, { type: "warning" }),
            " ",
            confirmationTitle)));
    }
}
exports.ConfirmableDeleteButton = ConfirmableDeleteButton;
//# sourceMappingURL=confirmable-delete.js.map