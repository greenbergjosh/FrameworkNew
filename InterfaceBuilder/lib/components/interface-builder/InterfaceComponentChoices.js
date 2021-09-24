"use strict";
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
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var dnd_1 = require("./dnd");
var registry_1 = require("./registry");
exports.InterfaceComponentChoices = function (_a) {
    var componentRegistry = react_1.default.useContext(registry_1.ComponentRegistryContext).componentRegistry;
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(antd_1.Collapse, { accordion: true, defaultActiveKey: ["Form"] }, Object.entries(sortedGroupedComponents(componentRegistry.cache)).map(function (_a) {
            var _b = __read(_a, 2), category = _b[0], layoutDefinitions = _b[1];
            return (react_1.default.createElement(antd_1.Collapse.Panel, { header: category, key: category }, layoutDefinitions.map(function (layoutDefinition, index) { return (react_1.default.createElement(dnd_1.Draggable, { key: layoutDefinition.name, data: layoutDefinition, draggableId: layoutDefinition.name, index: index, title: layoutDefinition.title, type: "INTERFACE_COMPONENT" }, function (_a) {
                var isDragging = _a.isDragging;
                return (react_1.default.createElement("div", { style: { width: "100%", cursor: "pointer" } },
                    react_1.default.createElement(antd_1.Tag, { color: isDragging ? "#43C1FF" : "#108ee9", style: {
                            width: "95%",
                            margin: "auto",
                        } },
                        layoutDefinition.icon && (react_1.default.createElement(antd_1.Icon, { type: layoutDefinition.icon, style: { marginRight: "1em" } })),
                        layoutDefinition.title)));
            })); })));
        }))));
};
function sortedGroupedComponents(componentRegistry) {
    return fp_1.groupBy(function (layoutDefinition) { return layoutDefinition.category; }, Object.values(componentRegistry)
        .map(function (componentClass) { return componentClass.getLayoutDefinition(); })
        .sort(function (a, b) {
        return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
    }));
}
//# sourceMappingURL=InterfaceComponentChoices.js.map