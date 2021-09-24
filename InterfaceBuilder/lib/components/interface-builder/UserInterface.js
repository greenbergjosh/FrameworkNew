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
var ComponentRenderer_1 = require("./ComponentRenderer");
var DragDropContext_1 = __importDefault(require("./dnd/util/DragDropContext"));
var DraggableContext_1 = require("./dnd/util/DraggableContext");
var rainy_window_png_1 = __importDefault(require("./images/rainy-window.png"));
var InterfaceComponentChoices_1 = require("./InterfaceComponentChoices");
var move_in_list_1 = require("./lib/move-in-list");
var ManageComponentModal_1 = require("./manage/ManageComponentModal");
var registry_1 = require("./registry");
require("./user-interface.scss");
var UserInterfaceContextManager_1 = require("./UserInterfaceContextManager");
var DataPathContext_1 = require("./util/DataPathContext");
var UserInterface = /** @class */ (function (_super) {
    __extends(UserInterface, _super);
    function UserInterface() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            clipboardComponent: null,
            components: [],
            error: null,
            itemToAdd: null,
            itemToEdit: null,
            fullscreen: false,
        };
        _this.handleDrop = function (draggedItem, dropTarget) {
            if (_this.props.mode === "edit") {
                // You can't move a parent into a child, so we'll ignore those drops
                if (dropTarget.droppableId.startsWith(draggedItem.draggableId + "."))
                    return;
                var _a = _this.props, components = _a.components, onChangeSchema = _a.onChangeSchema;
                var dropHelperResult = handleDropHelper(components, draggedItem, dropTarget);
                console.log("UserInterface.onDrop", { dropHelperResult: dropHelperResult });
                if (!dropHelperResult.itemToAdd) {
                    onChangeSchema(dropHelperResult.components);
                }
                else {
                    _this.setState(dropHelperResult);
                }
            }
        };
        return _this;
    }
    UserInterface.prototype.componentDidCatch = function (error, info) {
        console.error("UserInterface.componentDidCatch", error, info);
        this.setState({ error: error.toString() });
    };
    UserInterface.prototype.render = function () {
        var _this = this;
        var _a = this.props, components = _a.components, contextManager = _a.contextManager, data = _a.data, mode = _a.mode, onChangeData = _a.onChangeData;
        var _b = this.state, clipboardComponent = _b.clipboardComponent, error = _b.error, fullscreen = _b.fullscreen, itemToAdd = _b.itemToAdd, itemToEdit = _b.itemToEdit;
        if (error) {
            return (react_1.default.createElement("img", { src: rainy_window_png_1.default /* eslint-disable-line @typescript-eslint/camelcase */, alt: "A window showing a rainy day with text 'Something went wrong'" }));
        }
        var content = (react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: components, data: data, mode: mode, onChangeData: onChangeData, onChangeSchema: this.props.mode === "edit"
                ? this.props.onChangeSchema
                : function (newSchema) {
                    console.warn("UserInterface.render", "ComponentRenderer/onChangeSchema", "Cannot invoke onChangeSchema when UserInterface is not in 'edit' mode", { newSchema: newSchema });
                }, onDrop: this.handleDrop }));
        var draggableContextHandlers = {
            canCopy: true,
            canDelete: true,
            canEdit: true,
            canPaste: !!clipboardComponent,
            onCopy: function (draggedItem) {
                console.log("UserInterface.draggableContextHandlers", "onCopy", draggedItem);
                _this.setState({ clipboardComponent: draggedItem });
            },
            onDelete: function (deleteItem) {
                console.log("UserInterface.draggableContextHandlers", "onDelete", deleteItem);
                // Must be in edit mode in order to delete things
                if (_this.props.mode === "edit") {
                    // Can't invoke delete on things that aren't in a list container
                    if (deleteItem.parentDroppableId) {
                        // List containing this item
                        var originalList = deleteItem.parentDroppableId === ComponentRenderer_1.UI_ROOT
                            ? components
                            : fp_1.getOr([], deleteItem.parentDroppableId, components);
                        // Remove item from list
                        var updatedList = __spread(originalList.slice(0, deleteItem.index), originalList.slice(deleteItem.index + 1));
                        var updatedComponents = deleteItem.parentDroppableId === ComponentRenderer_1.UI_ROOT
                            ? updatedList
                            : fp_1.set(deleteItem.parentDroppableId, updatedList, components);
                        // Clean out anything in the add/edit state
                        _this.setState({ itemToAdd: null, itemToEdit: null });
                        // Fire the schema change event
                        _this.props.onChangeSchema(updatedComponents);
                    }
                }
            },
            onEdit: function (draggedItem) {
                console.log("UserInterface.draggableContextHandlers", "onEdit", draggedItem, components, fp_1.get(draggedItem.draggableId, components));
                _this.setState({
                    components: components,
                    itemToAdd: null,
                    itemToEdit: {
                        componentDefinition: draggedItem.item,
                        path: draggedItem.parentDroppableId || ComponentRenderer_1.UI_ROOT,
                        index: draggedItem.index,
                    },
                });
            },
            onPaste: function (draggedItem) {
                console.log("UserInterface.draggableContextHandlers", "onPaste", draggedItem);
            },
        };
        var contentWithContext = contextManager ? (react_1.default.createElement(UserInterfaceContextManager_1.UserInterfaceContext.Provider, { value: contextManager }, content)) : (content);
        return (react_1.default.createElement("div", { className: classnames_1.default("user-iterface-builder", { fullscreen: fullscreen }) },
            react_1.default.createElement(DataPathContext_1.DataPathContext, null, function (parentPath) { return (react_1.default.createElement(DataPathContext_1.DataPathContext, { reset: true },
                react_1.default.createElement(registry_1.ComponentRegistryContext.Provider, { value: { componentRegistry: registry_1.registry } },
                    react_1.default.createElement(DragDropContext_1.default.HTML5, null,
                        react_1.default.createElement(DraggableContext_1.DraggableContext.Provider, { value: draggableContextHandlers }, mode === "edit" ? (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(antd_1.Layout, null,
                                react_1.default.createElement(antd_1.Layout.Sider, { style: { background: "#fff" } },
                                    react_1.default.createElement(antd_1.Row, null,
                                        react_1.default.createElement(antd_1.Col, { span: 19 },
                                            react_1.default.createElement(antd_1.Typography.Title, { level: 4 }, "Components")),
                                        react_1.default.createElement(antd_1.Col, { span: 5 })),
                                    react_1.default.createElement(antd_1.Divider, null),
                                    react_1.default.createElement(InterfaceComponentChoices_1.InterfaceComponentChoices, null)),
                                react_1.default.createElement(antd_1.Layout, null,
                                    react_1.default.createElement(antd_1.Layout.Content, { style: {
                                            margin: "24px 16px",
                                            padding: 24,
                                            background: "#fff",
                                            minHeight: 280,
                                        } }, contentWithContext))),
                            react_1.default.createElement(ManageComponentModal_1.ManageComponentModal, { componentDefinition: (itemToAdd && itemToAdd.componentDefinition) ||
                                    (itemToEdit && itemToEdit.componentDefinition), onCancel: function () {
                                    // console.log("UserInterface.onCancel")
                                    _this.setState({ itemToAdd: null, itemToEdit: null });
                                }, onConfirm: function (componentDefinition) {
                                    // TODO: Cleanup and consolidate these code branches
                                    if (_this.props.mode === "edit") {
                                        // If we're adding the item, insert it
                                        if (itemToAdd) {
                                            // Find which component list we're inserting into
                                            var relevantList = (itemToAdd.path === ComponentRenderer_1.UI_ROOT
                                                ? components
                                                : fp_1.getOr([], itemToAdd.path, components)) || [];
                                            if (typeof relevantList.slice !== "function") {
                                                console.warn("UserInterface", "The path", itemToAdd.path, "yields", relevantList, "which is not an array!");
                                            }
                                            // Slice this item into the list
                                            var updatedList = __spread(relevantList.slice(0, itemToAdd.index), [
                                                componentDefinition
                                            ], relevantList.slice(itemToAdd.index));
                                            // Merge back into the parent component list
                                            var updatedComponents = itemToAdd.path === ComponentRenderer_1.UI_ROOT
                                                ? updatedList
                                                : fp_1.set(itemToAdd.path, updatedList, components);
                                            // Clear the modal and all adding state
                                            _this.setState({ itemToAdd: null, itemToEdit: null });
                                            // Fire the schema change up the chain
                                            _this.props.onChangeSchema(updatedComponents);
                                        }
                                        else if (itemToEdit) {
                                            // Find which component list we're inserting into
                                            var relevantList = (itemToEdit.path === ComponentRenderer_1.UI_ROOT
                                                ? components
                                                : fp_1.getOr([], itemToEdit.path, components)) || [];
                                            if (typeof relevantList.slice !== "function") {
                                                console.warn("UserInterface", "The path", itemToEdit.path, "yields", relevantList, "which is not an array!");
                                            }
                                            // Slice this item into the list, replacing the existing item
                                            var updatedList = __spread(relevantList.slice(0, itemToEdit.index), [
                                                componentDefinition
                                            ], relevantList.slice(itemToEdit.index + 1));
                                            // Merge back into the parent component list
                                            var updatedComponents = itemToEdit.path === ComponentRenderer_1.UI_ROOT
                                                ? updatedList
                                                : fp_1.set(itemToEdit.path, updatedList, components);
                                            // Clear the modal and all adding state
                                            _this.setState({ itemToAdd: null, itemToEdit: null });
                                            // Fire the schema change up the chain
                                            _this.props.onChangeSchema(updatedComponents);
                                        }
                                    }
                                } }))) : (contentWithContext)))))); })));
    };
    return UserInterface;
}(react_1.default.Component));
exports.UserInterface = UserInterface;
function handleDropHelper(components, draggedItem, dropTarget) {
    console.log.apply(console, __spread(["UserInterface/handleDropHelper"], components));
    // If this dragged item has a componentDefinition, it must be to create a new component, not rearrange existing ones
    if (draggedItem.item && draggedItem.item.componentDefinition) {
        return {
            components: components,
            itemToAdd: {
                componentDefinition: draggedItem.item.componentDefinition,
                path: dropTarget.droppableId,
                index: dropTarget.dropIndex,
            },
            itemToEdit: null,
        };
    }
    // Rearranged in the same list
    else if (dropTarget.droppableId === draggedItem.parentDroppableId) {
        var originalList = dropTarget.droppableId === ComponentRenderer_1.UI_ROOT
            ? components
            : fp_1.getOr([], dropTarget.droppableId, components);
        var updatedList = move_in_list_1.moveInList(originalList, draggedItem.index, dropTarget.dropIndex);
        return {
            components: dropTarget.droppableId === ComponentRenderer_1.UI_ROOT
                ? updatedList
                : fp_1.set(dropTarget.droppableId, updatedList, components),
            itemToAdd: null,
            itemToEdit: null,
        };
    }
    // This item came from another droppable list. We should remove it from that list and move it to this one
    else if (draggedItem.parentDroppableId) {
        // If one of the two lists is the root, we have to take some special actions
        if (draggedItem.parentDroppableId === ComponentRenderer_1.UI_ROOT || dropTarget.droppableId === ComponentRenderer_1.UI_ROOT) {
            // Find the sublist the dragged item came from
            var sourceList = draggedItem.parentDroppableId === ComponentRenderer_1.UI_ROOT
                ? components
                : fp_1.getOr([], draggedItem.parentDroppableId, components);
            // Find the sublist the drop occurred in, and add the dragged item
            var destinationList = dropTarget.droppableId === ComponentRenderer_1.UI_ROOT
                ? components
                : (fp_1.getOr([], dropTarget.droppableId, components) || []);
            // We know both lists can't be "root" because then we'd have hit the outer if instead
            // If the item was dragged from the root, take the update source list as the new root
            // Alter it to add the updated destination information
            if (draggedItem.parentDroppableId === ComponentRenderer_1.UI_ROOT) {
                // Add the dragged item to the destination list
                var updatedDestinationList = __spread(destinationList.slice(0, dropTarget.dropIndex), [
                    sourceList[draggedItem.index]
                ], destinationList.slice(dropTarget.dropIndex));
                // Since the destination is nested, we update it into components first because the
                // source update changes the indices
                var componentsWithUpdatedDestination = fp_1.set(dropTarget.droppableId, updatedDestinationList, components);
                // Remove the draggedItem from the source (root) list
                var updatedComponents = __spread(componentsWithUpdatedDestination.slice(0, draggedItem.index), componentsWithUpdatedDestination.slice(draggedItem.index + 1));
                return {
                    components: updatedComponents,
                    itemToAdd: null,
                    itemToEdit: null,
                };
            }
            // If the item was dragged from a sublist to the root, take the destination as the new root
            // Alter it to add the updated source information
            else if (dropTarget.droppableId === ComponentRenderer_1.UI_ROOT) {
                // Remove the dragged item from the source list
                var updatedSourceList = __spread(sourceList.slice(0, draggedItem.index), sourceList.slice(draggedItem.index + 1));
                // Since the destination is nested, we update it into components first because the
                // source update changes the indices
                var componentsWithUpdatedSource = fp_1.set(draggedItem.parentDroppableId, updatedSourceList, components);
                // Add the draggedItem to the destination (root) list
                var updatedComponents = __spread(componentsWithUpdatedSource.slice(0, dropTarget.dropIndex), [
                    sourceList[draggedItem.index]
                ], componentsWithUpdatedSource.slice(dropTarget.dropIndex));
                return {
                    components: updatedComponents,
                    itemToAdd: null,
                    itemToEdit: null,
                };
            }
        }
        // Neither list was the root, so we have to modify the root to account for both sets of changes without
        // having the changes overwrite each other
        // Check to see if the dropTarget is a parent/ancestor of the item being dragged
        else if (draggedItem.parentDroppableId.startsWith(dropTarget.droppableId + ".")) {
            // Find the sublist the dragged item came from and remove it
            var sourceList = fp_1.getOr([], draggedItem.parentDroppableId, components);
            var updatedSourceList = __spread(sourceList.slice(0, draggedItem.index), sourceList.slice(draggedItem.index + 1));
            // We modify the component list to get a new component list for the deeper item that
            // will fail if we modify the outer item first
            var interimComponents = fp_1.set(draggedItem.parentDroppableId, updatedSourceList, components);
            // Find the sublist the drop occurred in, and add the dragged item
            // By using the interim components, we'll include the dragged item removal from above
            var destinationList = fp_1.getOr([], dropTarget.droppableId, interimComponents);
            var updatedDestinationList = __spread(destinationList.slice(0, dropTarget.dropIndex), [
                sourceList[draggedItem.index]
            ], destinationList.slice(dropTarget.dropIndex));
            return {
                components: fp_1.set(dropTarget.droppableId, updatedDestinationList, interimComponents),
                itemToAdd: null,
                itemToEdit: null,
            };
        }
        // Check to see if the draggedItem comes from a parent/ancestor of the dropTarget
        else if (dropTarget.droppableId.startsWith(draggedItem.parentDroppableId + ".")) {
            var tmpSourceList = fp_1.getOr([], draggedItem.parentDroppableId, components);
            // Find the sublist the dropTarget came from and add the dragged item into it
            var destinationList = fp_1.getOr([], dropTarget.droppableId, components);
            var updatedDestinationList = __spread(destinationList.slice(0, dropTarget.dropIndex), [
                tmpSourceList[draggedItem.index]
            ], destinationList.slice(dropTarget.dropIndex));
            // We modify the component list to get a new component list for the deeper item that
            // will fail if we modify the outer item first
            var interimComponents = fp_1.set(dropTarget.droppableId, updatedDestinationList, components);
            // Find the sublist the draggedItem came from, and remote it
            // By using the interim components, we'll include the dragged item addition from above
            var sourceList = fp_1.getOr([], draggedItem.parentDroppableId, interimComponents);
            var updatedSourceList = __spread(sourceList.slice(0, draggedItem.index), sourceList.slice(draggedItem.index + 1));
            return {
                components: fp_1.set(draggedItem.parentDroppableId, updatedSourceList, interimComponents),
                itemToAdd: null,
                itemToEdit: null,
            };
        }
        else {
            // Find the sublist the dragged item came from and remove it
            var sourceList = fp_1.getOr([], draggedItem.parentDroppableId, components);
            var updatedSourceList = __spread(sourceList.slice(0, draggedItem.index), sourceList.slice(draggedItem.index + 1));
            // Capture the interim modification state of the whole component list
            var interimComponents = fp_1.set(draggedItem.parentDroppableId, updatedSourceList, components);
            // Find the sublist the drop occurred in, and add the dragged item
            var destinationList = fp_1.getOr([], dropTarget.droppableId, interimComponents);
            var updatedDestinationList = __spread(destinationList.slice(0, dropTarget.dropIndex), [
                sourceList[draggedItem.index]
            ], destinationList.slice(dropTarget.dropIndex));
            return {
                components: fp_1.set(dropTarget.droppableId, updatedDestinationList, interimComponents),
                itemToAdd: null,
                itemToEdit: null,
            };
        }
    }
    // The dragged item did not come from a droppable list, so we simply need to add to the destination
    else {
        // Find the destination list and add the dragged item contents
        var destinationList = dropTarget.droppableId === ComponentRenderer_1.UI_ROOT
            ? components
            : fp_1.getOr([], dropTarget.droppableId, components);
        var updatedDestinationList = __spread(destinationList.slice(0, dropTarget.dropIndex), [
            draggedItem.item
        ], destinationList.slice(dropTarget.dropIndex));
        return {
            components: dropTarget.droppableId === ComponentRenderer_1.UI_ROOT
                ? updatedDestinationList
                : fp_1.set(dropTarget.droppableId, updatedDestinationList, components),
            itemToAdd: null,
            itemToEdit: null,
        };
    }
    console.warn("UserInterface/handleDrop", "Failed to handle component update");
    return { components: components, itemToAdd: null, itemToEdit: null };
}
exports.handleDropHelper = handleDropHelper;
//# sourceMappingURL=UserInterface.js.map