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
var registry_1 = require("../registry");
var ManageComponentForm_1 = require("./ManageComponentForm");
var ManageComponentPreview_1 = require("./ManageComponentPreview");
exports.ManageComponentModal = function (_a) {
    var propComponentDefinition = _a.componentDefinition, onCancel = _a.onCancel, onConfirm = _a.onConfirm;
    var _b = __read(react_1.default.useState(propComponentDefinition), 2), componentDefinition = _b[0], updateComponentDefinition = _b[1];
    react_1.default.useEffect(function () {
        console.log("ManageComponentModal useEffect", { componentDefinition: componentDefinition, propComponentDefinition: propComponentDefinition });
        if (!componentDefinition && propComponentDefinition) {
            var Component_1 = propComponentDefinition.component && registry_1.registry.lookup(propComponentDefinition.component);
            // Determine the default values for this component
            var defaults = (Component_1 && Component_1.getManageFormDefaults()) || {};
            var newComponentDefinition = __assign(__assign({}, defaults), propComponentDefinition);
            // Set the active component in the modal to be the one with all the defaults entered
            updateComponentDefinition(newComponentDefinition);
        }
        else if (!propComponentDefinition) {
            updateComponentDefinition(propComponentDefinition);
        }
    }, [componentDefinition, propComponentDefinition]);
    var Component = componentDefinition &&
        componentDefinition.component &&
        registry_1.registry.lookup(componentDefinition && componentDefinition.component);
    var layoutDefinition = Component && Component.getLayoutDefinition();
    var manageForm = Component && Component.manageForm();
    console.log("ManageComponentModal.render", { componentDefinition: componentDefinition, propComponentDefinition: propComponentDefinition });
    return (react_1.default.createElement(antd_1.Modal, { title: layoutDefinition && layoutDefinition.title, visible: !!propComponentDefinition, okText: "Save", onCancel: function (e) {
            console.log("ManageComponentModal.onCancel", e);
            onCancel();
        }, onOk: function (e) {
            console.log("ManageComponentModal.onOk", e, componentDefinition);
            onConfirm(componentDefinition);
        }, style: { maxWidth: "1200px", width: "95%" }, width: "95%" },
        react_1.default.createElement("div", null,
            react_1.default.createElement(antd_1.Row, null,
                react_1.default.createElement(antd_1.Col, { span: 16 },
                    react_1.default.createElement(antd_1.Typography.Title, { level: 4 }, "Definition"),
                    layoutDefinition && componentDefinition && manageForm && (react_1.default.createElement(ManageComponentForm_1.ManageComponentForm, { componentDefinition: componentDefinition, onChangeDefinition: function (newDefinition) {
                            console.log("ManageComponentModal.onChangeDefinition", newDefinition);
                            updateComponentDefinition(__assign(__assign({}, componentDefinition), newDefinition));
                        }, manageForm: manageForm, layoutDefinition: layoutDefinition }))),
                react_1.default.createElement(antd_1.Col, { span: 8 },
                    react_1.default.createElement(antd_1.Typography.Title, { level: 4 }, "Preview"),
                    Component && layoutDefinition && (react_1.default.createElement(ManageComponentPreview_1.ManageComponentPreview, { Component: Component, componentDefinition: componentDefinition, layoutDefinition: layoutDefinition })))))));
};
//# sourceMappingURL=ManageComponentModal.js.map