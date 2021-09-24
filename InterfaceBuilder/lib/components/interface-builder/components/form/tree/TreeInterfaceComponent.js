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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var DataPathContext_1 = require("../../../util/DataPathContext");
var ComponentRenderer_1 = require("../../../ComponentRenderer");
var confirmable_delete_1 = require("./confirmable-delete");
require("./tree-interface-component.scss");
var tree_manage_form_1 = require("./tree-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var TreeInterfaceComponent = /** @class */ (function (_super) {
    __extends(TreeInterfaceComponent, _super);
    function TreeInterfaceComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.addEntry = function (type) { return function () {
            var _a = _this.props, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            var data = fp_1.getOr([], valueKey, userInterfaceData);
            var newItem = {
                key: String(Math.random()),
                title: "New " + type + " " + Math.round(Math.random() * 100),
            };
            if (type !== "leaf") {
                newItem.children = [];
                newItem.isLeaf = false;
            }
            else {
                newItem.isLeaf = true;
            }
            onChangeData && onChangeData(fp_1.set(valueKey, __spread(data, [newItem]), userInterfaceData));
        }; };
        _this.handleDragOver = function (event) {
            console.log("TreeInterfaceComponent.handleDragOver", event, event.node.isLeaf());
        };
        // Adapated from suggested Ant code at https://ant.design/components/tree/
        _this.handleDrop = function (event) {
            var _a = _this.props, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            var data = fp_1.cloneDeep(fp_1.getOr([], valueKey, userInterfaceData));
            var dropKey = event.node.props.eventKey || "";
            var dragKey = event.dragNode.props.eventKey || "";
            var dropPos = event.node.props.pos.split("-");
            var dropPosition = event.dropPosition - Number(dropPos[dropPos.length - 1]);
            // Find dragObject
            var dragObj;
            findTreeNode(data, dragKey, function (item, index, arr) {
                arr.splice(index, 1);
                dragObj = item;
            });
            if (!event.dropToGap && !event.node.isLeaf()) {
                // Drop on the content
                findTreeNode(data, dropKey, function (item) {
                    item.children = item.children || [];
                    item.children.push(dragObj);
                });
            }
            else if (!event.node.isLeaf() &&
                (event.node.props.children || []).length > 0 && // Has children
                event.node.props.expanded && // Is expanded
                dropPosition === 1 // On the bottom gap
            ) {
                findTreeNode(data, dropKey, function (item) {
                    item.children = item.children || [];
                    item.children.unshift(dragObj);
                });
            }
            else {
                findTreeNode(data, dropKey, function (item, index, arr) {
                    arr.splice(index + (dropPosition === -1 ? 0 : 1), 0, dragObj);
                });
            }
            onChangeData && onChangeData(fp_1.set(valueKey, data, userInterfaceData));
        };
        _this.handleSelect = function (selectedKeys, event) {
            console.log("TreeInterfaceComponent.handleSelect", event, event.node.isLeaf(), selectedKeys);
            var _a = _this.props, allowSelectParents = _a.allowSelectParents, onChangeData = _a.onChangeData, selectable = _a.selectable, selectedKey = _a.selectedKey, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            var data = fp_1.getOr([], valueKey, userInterfaceData);
            if (selectable &&
                (allowSelectParents || (!allowSelectParents && event.node.isLeaf()))) {
                onChangeData &&
                    selectedKey &&
                    onChangeData(fp_1.set(selectedKey, findTreeNode(data, selectedKeys[0]), userInterfaceData));
            }
        };
        _this.handleDelete = function (item) {
            var _a = _this.props, onChangeData = _a.onChangeData, selectedKey = _a.selectedKey, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            var data = fp_1.cloneDeep(fp_1.getOr([], valueKey, userInterfaceData));
            var selected = selectedKey && fp_1.get(selectedKey, userInterfaceData);
            findTreeNode(data, item.key, function (item, index, arr) {
                arr.splice(index, 1);
            });
            var updatedUserInterfaceData = selectedKey && selected === item.key ? fp_1.set(selectedKey, null, data) : userInterfaceData;
            onChangeData && onChangeData(fp_1.set(valueKey, data, updatedUserInterfaceData));
        };
        return _this;
    }
    TreeInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "tree",
            title: "Tree",
            icon: "apartment",
            componentDefinition: {
                component: "tree",
            },
        };
    };
    TreeInterfaceComponent.prototype.render = function () {
        var _a = this.props, addLabel = _a.addLabel, addLeafLabel = _a.addLeafLabel, addParentLabel = _a.addParentLabel, allowAdd = _a.allowAdd, allowAddLeaves = _a.allowAddLeaves, allowAddParents = _a.allowAddParents, allowDetails = _a.allowDetails, allowNestInLeaves = _a.allowNestInLeaves, components = _a.components, detailsOrientation = _a.detailsOrientation, emptyText = _a.emptyText, modifiable = _a.modifiable, onChangeData = _a.onChangeData, selectedKey = _a.selectedKey, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        var data = fp_1.getOr([], valueKey, userInterfaceData);
        var selected = selectedKey && fp_1.get(selectedKey, userInterfaceData);
        var renderedTree = (react_1.default.createElement(react_1.default.Fragment, null,
            data.length === 0 && react_1.default.createElement(antd_1.Empty, { description: emptyText }),
            react_1.default.createElement(antd_1.Tree, { showLine: true, draggable: modifiable, switcherIcon: react_1.default.createElement(antd_1.Icon, { type: "down" }), defaultExpandedKeys: [], onDragOver: this.handleDragOver, onDrop: this.handleDrop, onSelect: this.handleSelect, selectedKeys: selected && [selected.key] }, renderTreeNodes(data, this.handleDelete))));
        var renderedDetails = allowDetails && (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "components" },
            react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: components, data: selected ? __assign(__assign({}, userInterfaceData), selected) : userInterfaceData, onChangeData: function (updatedUserInterfaceData) {
                    var updatedSelected = selectedKey && fp_1.get(selectedKey, updatedUserInterfaceData);
                    var updatedData = fp_1.cloneDeep(fp_1.getOr([], valueKey, updatedUserInterfaceData));
                    findTreeNode(updatedData, selected.key, function (item, index, arr) {
                        arr.splice(index, 1, updatedSelected);
                    });
                    onChangeData && onChangeData(fp_1.set(valueKey, updatedData, updatedUserInterfaceData));
                }, onChangeSchema: function (newSchema) {
                    console.warn("TreeInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in Tree", { newSchema: newSchema });
                } })));
        return (react_1.default.createElement(react_1.default.Fragment, null,
            orientTreeAndDetails(detailsOrientation, renderedTree, renderedDetails),
            modifiable && allowNestInLeaves && allowAdd && (react_1.default.createElement(antd_1.Button, { onClick: this.addEntry("standard") }, addLabel)),
            modifiable && !allowNestInLeaves && allowAddParents && (react_1.default.createElement(antd_1.Button, { onClick: this.addEntry("parent") }, addParentLabel)),
            modifiable && !allowNestInLeaves && allowAddLeaves && (react_1.default.createElement(antd_1.Button, { onClick: this.addEntry("leaf") }, addLeafLabel))));
    };
    TreeInterfaceComponent.defaultProps = {
        addLabel: "Add Item",
        addLeafLabel: "Add Leaf",
        addParentLabel: "Add Parent",
        emptyText: "No Items",
    };
    TreeInterfaceComponent.manageForm = tree_manage_form_1.treeManageForm;
    return TreeInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.TreeInterfaceComponent = TreeInterfaceComponent;
var findTreeNode = function (data, key, callback) {
    var e_1, _a;
    try {
        // BFS tree traversal. There aren't likely to ever be enough nodes to blow out the stack
        // and the callback function requires more context than is easily provided when you use a stack or queue
        for (var _b = __values(data.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), index = _d[0], item = _d[1];
            if (item.key === key) {
                if (callback) {
                    callback(item, index, data);
                }
                return item;
            }
            else if (item.children) {
                var foundChildNode = findTreeNode(item.children, key, callback);
                if (foundChildNode) {
                    return foundChildNode;
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
};
var renderTreeNodes = function (data, onDelete) {
    return data.map(function (item) {
        if (item.children && item.children.length) {
            return (react_1.default.createElement(antd_1.Tree.TreeNode, { key: item.key, isLeaf: item.isLeaf, title: react_1.default.createElement(react_1.default.Fragment, null,
                    item.title,
                    " ",
                    react_1.default.createElement(antd_1.Divider, { type: "vertical", className: "tree-component-delete-divider" }),
                    react_1.default.createElement(confirmable_delete_1.ConfirmableDeleteButton, { className: "tree-component-delete-button", confirmationMessage: "Are you sure want to delete this item? (All children will be deleted, too)", confirmationTitle: "Confirm Delete", onDelete: function () { return onDelete(item); } })) }, renderTreeNodes(item.children, onDelete)));
        }
        return (react_1.default.createElement(antd_1.Tree.TreeNode, { key: item.key, isLeaf: item.isLeaf, title: react_1.default.createElement(react_1.default.Fragment, null,
                item.title,
                " ",
                react_1.default.createElement(antd_1.Divider, { type: "vertical", className: "tree-component-delete-divider" }),
                react_1.default.createElement(confirmable_delete_1.ConfirmableDeleteButton, { className: "tree-component-delete-button", confirmationMessage: "Are you sure want to delete this item?", confirmationTitle: "Confirm Delete", onDelete: function () { return onDelete(item); } })) }));
    });
};
function orientTreeAndDetails(orientation, tree, details) {
    if (orientation === "left")
        return (react_1.default.createElement(antd_1.Row, null,
            react_1.default.createElement(antd_1.Col, { span: 8 }, details),
            react_1.default.createElement(antd_1.Col, { span: 16 }, tree)));
    else if (orientation === "right")
        return (react_1.default.createElement(antd_1.Row, null,
            react_1.default.createElement(antd_1.Col, { span: 8 }, tree),
            react_1.default.createElement(antd_1.Col, { span: 16 }, details)));
    else if (orientation === "below")
        return (react_1.default.createElement(react_1.default.Fragment, null,
            tree,
            react_1.default.createElement(antd_1.Divider, null),
            details));
    else {
        console.warn("TreeInterfaceComponent.orientTreeAndDetails", "Tree using default orientation because given orientation was " + orientation);
        return (react_1.default.createElement(react_1.default.Fragment, null,
            tree,
            details));
    }
}
//# sourceMappingURL=TreeInterfaceComponent.js.map