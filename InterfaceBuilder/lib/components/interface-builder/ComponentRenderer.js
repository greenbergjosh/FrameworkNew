"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var deep_diff_1 = require("./lib/deep-diff");
var DataPathContext_1 = require("./util/DataPathContext");
var dnd_1 = require("./dnd");
var registry_1 = require("./registry");
var RenderInterfaceComponent_1 = require("./RenderInterfaceComponent");
exports.ComponentRendererModeContext = react_1.default.createContext("display");
exports.UI_ROOT = "UI-Root";
exports._ComponentRenderer = function (_a) {
    var componentLimit = _a.componentLimit, components = _a.components, data = _a.data, dragDropDisabled = _a.dragDropDisabled, propMode = _a.mode, onChangeData = _a.onChangeData, onChangeSchema = _a.onChangeSchema, onDrop = _a.onDrop;
    var componentRegistry = react_1.default.useContext(registry_1.ComponentRegistryContext).componentRegistry;
    var contextMode = react_1.default.useContext(exports.ComponentRendererModeContext);
    var mode = propMode || contextMode;
    var content = components.map(function (componentDefinition, index) { return (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: index, key: componentDefinition.component + "-" + index }, function (path) { return (react_1.default.createElement(RenderInterfaceComponent_1.RenderInterfaceComponent, { Component: componentRegistry.lookup(componentDefinition.component), componentDefinition: componentDefinition, data: data, dragDropDisabled: dragDropDisabled, index: index, mode: mode, onChangeData: function (newData) {
            // console.log("ComponentRenderer.render", "onChangeData", {
            //   componentDefinition,
            //   newData,
            //   onChangeData,
            //   data,
            // })
            onChangeData && onChangeData(newData);
        }, onChangeSchema: function (newComponentDefinition) {
            if (mode === "edit") {
                // console.log("ComponentRenderer.render", "onChangeSchema", {
                //   componentDefinition,
                //   newComponentDefinition,
                //   onChangeSchema,
                //   path,
                //   index,
                //   components,
                // })
                // onChangeSchema && onChangeSchema(set(path, newComponentDefinition, components))
                onChangeSchema && onChangeSchema(fp_1.set(index, newComponentDefinition, components));
            }
        }, path: path })); })); });
    // console.log("ComponentRenderer.render", { components, data })
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(exports.ComponentRendererModeContext.Provider, { value: mode }, mode === "edit" && !dragDropDisabled ? (react_1.default.createElement(DataPathContext_1.DataPathContext, null, function (path) { return (react_1.default.createElement(dnd_1.Droppable, { data: components, allowDrop: !componentLimit || components.length < componentLimit, droppableId: path || exports.UI_ROOT, onDrop: onDrop, type: "INTERFACE_COMPONENT" }, function (_a) {
            var isOver = _a.isOver;
            return content;
        })); })) : (content))));
};
exports._ComponentRenderer.defaultProps = {
    components: [],
};
exports.ComponentRenderer = react_1.default.memo(exports._ComponentRenderer, function (prevProps, nextProps) {
    // @ts-ignore
    var simplePropEquality = dnd_1.shallowPropCheck(["components", "data", "mode"])(prevProps, nextProps);
    var runDeepDiff = function () {
        return deep_diff_1.deepDiff(prevProps, nextProps, function (k) { return ["onChangeSchema", "onChangeData"].includes(k); });
    };
    // console.log("ComponentRenderer.memo", simplePropEquality, runDeepDiff())
    return simplePropEquality && !runDeepDiff();
});
//# sourceMappingURL=ComponentRenderer.js.map