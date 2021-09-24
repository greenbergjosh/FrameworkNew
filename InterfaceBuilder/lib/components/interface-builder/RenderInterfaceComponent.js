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
var antd_1 = require("antd");
var json_logic_js_1 = __importDefault(require("json-logic-js"));
var react_1 = __importDefault(require("react"));
var Option_1 = require("./lib/Option");
var dnd_1 = require("./dnd");
var RenderInterfaceComponent = /** @class */ (function (_super) {
    __extends(RenderInterfaceComponent, _super);
    function RenderInterfaceComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { error: null };
        return _this;
    }
    RenderInterfaceComponent.prototype.componentDidCatch = function (error, info) {
        console.error("Error rendering component", { props: this.props, error: error, info: info });
        this.setState({ error: error.toString() });
    };
    RenderInterfaceComponent.prototype.render = function () {
        var _a = this.props, Component = _a.Component, componentDefinition = _a.componentDefinition, data = _a.data, dragDropDisabled = _a.dragDropDisabled, index = _a.index, mode = _a.mode, onChangeData = _a.onChangeData, onChangeSchema = _a.onChangeSchema, path = _a.path;
        var error = this.state.error;
        var shouldBeHidden = componentDefinition.hidden ||
            (componentDefinition.visibilityConditions &&
                !Option_1.tryCatch(function () { return json_logic_js_1.default.apply(componentDefinition.visibilityConditions, data); }).foldL(function () {
                    console.warn("Error occurred while processing the visibility conditions in component definition. Component will render as visible.", componentDefinition, componentDefinition.visibilityConditions);
                    return true;
                }, function (logicResult) { return logicResult; }));
        if (shouldBeHidden) {
            return null;
        }
        if (error) {
            return (react_1.default.createElement(antd_1.Alert, { message: "Component Error", description: "An error occurred while rendering the component: " + componentDefinition.component, type: "error" }));
        }
        if (!Component) {
            console.error("Missing Component " + componentDefinition.component, {
                componentDefinition: componentDefinition,
                index: index,
                mode: mode,
            });
        }
        var layoutDefintion = Component && Component.getLayoutDefinition && Component.getLayoutDefinition();
        var content = Component ? (react_1.default.createElement(Component, __assign({}, componentDefinition, { userInterfaceData: data, mode: mode, onChangeData: function (props) {
                console.log("RenderInterfaceComponent.onChangeData", props, onChangeData);
                onChangeData && onChangeData(props);
            }, onChangeSchema: function (newComponentDefinition) {
                console.log("RenderInterfaceComponent.onChangeSchema", newComponentDefinition, onChangeSchema);
                onChangeSchema && onChangeSchema(newComponentDefinition);
            }, userInterfaceSchema: componentDefinition }))) : (react_1.default.createElement(DebugComponent, { componentDefinition: componentDefinition, index: index, mode: mode }));
        var helpContent = !!componentDefinition.help && (react_1.default.createElement(antd_1.Tooltip, { title: componentDefinition.help },
            react_1.default.createElement(antd_1.Icon, { type: "question-circle-o" })));
        var wrapper = componentDefinition.label && componentDefinition.hideLabel !== true ? (layoutDefintion && layoutDefintion.formControl ? (react_1.default.createElement(antd_1.Form.Item, { colon: false, label: react_1.default.createElement(react_1.default.Fragment, null,
                componentDefinition.label,
                " ",
                helpContent) }, content)) : (react_1.default.createElement("div", { className: "label-wrapper" },
            react_1.default.createElement("label", null,
                componentDefinition.label,
                " ",
                helpContent),
            content))) : (content);
        return mode === "edit" && !dragDropDisabled ? (react_1.default.createElement(dnd_1.Draggable, { data: componentDefinition, draggableId: path, editable: true, index: index, title: layoutDefintion && layoutDefintion.title, type: "INTERFACE_COMPONENT" }, function (_a) {
            var isDragging = _a.isDragging;
            return wrapper;
        })) : (wrapper);
    };
    return RenderInterfaceComponent;
}(react_1.default.Component));
exports.RenderInterfaceComponent = RenderInterfaceComponent;
var DebugComponent = function (props) { return (react_1.default.createElement(antd_1.Alert, { closable: false, message: react_1.default.createElement("pre", null, JSON.stringify(props, null, 2)), type: "warning" })); };
//# sourceMappingURL=RenderInterfaceComponent.js.map