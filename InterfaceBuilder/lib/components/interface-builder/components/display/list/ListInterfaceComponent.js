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
var classnames_1 = __importDefault(require("classnames"));
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var v4_1 = __importDefault(require("uuid/v4"));
var ComponentRenderer_1 = require("../../../ComponentRenderer");
var dnd_1 = require("../../../dnd");
var DataPathContext_1 = require("../../../util/DataPathContext");
var list_manage_form_1 = require("./list-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var ListInterfaceComponent = /** @class */ (function (_super) {
    __extends(ListInterfaceComponent, _super);
    function ListInterfaceComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleAddClick = function () {
            var _a = _this.props, components = _a.components, interleave = _a.interleave, onChangeData = _a.onChangeData, unwrapped = _a.unwrapped, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            var entriesToAdd = interleave === "set"
                ? components.map(function (component, index) { return BaseInterfaceComponent_1.getDefaultsFromComponentDefinitions([component]); })
                : interleave === "none"
                    ? [BaseInterfaceComponent_1.getDefaultsFromComponentDefinitions([components[0]])]
                    : interleave === "round-robin"
                        ? [
                            BaseInterfaceComponent_1.getDefaultsFromComponentDefinitions([
                                components[(fp_1.get(valueKey, userInterfaceData) || []) % components.length],
                            ]),
                        ]
                        : [];
            onChangeData &&
                onChangeData(fp_1.set(valueKey, __spread((fp_1.get(valueKey, userInterfaceData) || []), (unwrapped ? entriesToAdd.map(function (entry) { return Object.values(entry)[0]; }) : entriesToAdd)), userInterfaceData));
        };
        _this.handleDeleteClick = function (_a) {
            var index = _a.index;
            var _b = _this.props, onChangeData = _b.onChangeData, userInterfaceData = _b.userInterfaceData, valueKey = _b.valueKey;
            var existingData = fp_1.get(valueKey, userInterfaceData) || [];
            onChangeData &&
                onChangeData(fp_1.set(valueKey, __spread(existingData.slice(0, index), existingData.slice(index + 1)), userInterfaceData));
        };
        _this.handleItemRearrange = function (draggedItem, dropTarget) {
            console.log("ListInterfaceComponent.onDrop", {
                draggedItem: draggedItem,
                dropTarget: dropTarget,
            });
            var _a = _this.props, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            var minIndex = Math.min(draggedItem.index, dropTarget.dropIndex);
            var maxIndex = Math.max(draggedItem.index, dropTarget.dropIndex);
            var existingData = fp_1.get(valueKey, userInterfaceData) || [];
            if (onChangeData) {
                if (draggedItem.index < dropTarget.dropIndex) {
                    onChangeData(fp_1.set(valueKey, __spread(existingData.slice(0, draggedItem.index), existingData.slice(draggedItem.index + 1, dropTarget.dropIndex), [
                        existingData[draggedItem.index]
                    ], existingData.slice(dropTarget.dropIndex)), userInterfaceData));
                }
                else if (draggedItem.index > dropTarget.dropIndex) {
                    onChangeData(fp_1.set(valueKey, __spread(existingData.slice(0, dropTarget.dropIndex), [
                        existingData[draggedItem.index]
                    ], existingData.slice(dropTarget.dropIndex, draggedItem.index), existingData.slice(draggedItem.index + 1)), userInterfaceData));
                }
            }
        };
        _this.handleChangeData = function (index) { return function (newData) {
            var _a = _this.props, onChangeData = _a.onChangeData, unwrapped = _a.unwrapped, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            var data = fp_1.get(valueKey, userInterfaceData) || [];
            console.log("ListInterfaceComponent.handleChangeData", {
                data: data,
                newData: newData,
            });
            return (onChangeData &&
                onChangeData(fp_1.set(valueKey + "." + index, unwrapped ? Object.values(newData)[0] : newData, userInterfaceData)));
        }; };
        _this.listId = v4_1.default();
        return _this;
    }
    ListInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "list",
            title: "List",
            icon: "unordered-list",
            componentDefinition: {
                component: "list",
                components: [],
            },
        };
    };
    ListInterfaceComponent.prototype.render = function () {
        var _this = this;
        var _a = this.props, addItemLabel = _a.addItemLabel, components = _a.components, emptyText = _a.emptyText, interleave = _a.interleave, onChangeData = _a.onChangeData, orientation = _a.orientation, preconfigured = _a.preconfigured, unwrapped = _a.unwrapped, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        // Get the list data from the data set
        var data = fp_1.get(valueKey, userInterfaceData) || [];
        return (react_1.default.createElement(ComponentRenderer_1.ComponentRendererModeContext.Consumer, null, function (mode) {
            switch (mode) {
                case "display": {
                    var finalComponents_1 = repeatedInterleave(interleave, components, data.length);
                    console.log("ListInterfaceComponent.render", { data: data });
                    return (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("div", { className: classnames_1.default("ui-list", {
                                "ui-list-horizontal": orientation === "horizontal",
                                "ui-list-vertical": orientation === "vertical",
                            }) }, finalComponents_1.length ? (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(dnd_1.Droppable, { data: finalComponents_1, allowDrop: true, droppableId: "LIST_" + _this.listId, onDrop: _this.handleItemRearrange, orientation: orientation, type: "LIST_" + _this.listId + "_ITEM" }, function () {
                                return finalComponents_1.map(function (iteratedComponent, index) { return (react_1.default.createElement(dnd_1.Draggable, { canCopy: false, canEdit: false, canPaste: false, data: data[index], draggableId: "LIST_" + _this.listId + "_ITEM_" + index, editable: true, onDelete: _this.handleDeleteClick, index: index, title: "", type: "LIST_" + _this.listId + "_ITEM" }, function () {
                                    var _a;
                                    return (react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { key: index, components: [iteratedComponent], componentLimit: interleave === "none" ? 1 : 0, data: data[index]
                                            ? unwrapped
                                                ? (_a = {},
                                                    // @ts-ignore
                                                    _a[iteratedComponent.valueKey] = data[index],
                                                    _a) : data[index]
                                            : {}, onChangeData: _this.handleChangeData(index), onChangeSchema: function (newSchema) {
                                            console.warn("ListInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in List.", { newSchema: newSchema });
                                        } }));
                                })); });
                            }))) : (react_1.default.createElement(antd_1.Empty, { description: emptyText }))),
                        react_1.default.createElement(antd_1.Button, { style: { display: "block", marginTop: "10px", marginBottom: "10px" }, onClick: _this.handleAddClick }, addItemLabel)));
                }
                case "edit": {
                    // Repeat the component once per item in the list
                    return (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "components" },
                        react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: components, componentLimit: interleave === "none" ? 1 : 0, data: data, dragDropDisabled: !!preconfigured, onChangeData: function (newData) {
                                return onChangeData && onChangeData(fp_1.set(valueKey, newData, userInterfaceData));
                            }, onChangeSchema: function (newSchema) {
                                console.warn("ListInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in List", { newSchema: newSchema });
                            } })));
                }
            }
        }));
    };
    ListInterfaceComponent.defaultProps = {
        addItemLabel: "Add Item",
        allowDelete: true,
        allowReorder: true,
        orientation: "vertical",
        interleave: "none",
        unwrapped: false,
        userInterfaceData: {},
        valueKey: "data",
    };
    ListInterfaceComponent.manageForm = list_manage_form_1.listManageForm;
    return ListInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.ListInterfaceComponent = ListInterfaceComponent;
function repeatedInterleave(interleave, items, count) {
    switch (interleave) {
        case "none": {
            var singleItem_1 = items[0];
            return __spread(Array(count)).map(function () { return (__assign({}, singleItem_1)); });
        }
        case "round-robin": {
            return __spread(Array(count)).map(function (_, index) { return (__assign({}, items[index % items.length])); });
        }
        case "set": {
            var realCount = Math.ceil(count / (items.length || 1)) * items.length;
            return __spread(Array(realCount)).map(function (_, index) { return (__assign({}, items[index % items.length])); });
        }
        default: {
            return [];
        }
    }
}
//# sourceMappingURL=ListInterfaceComponent.js.map