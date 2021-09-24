"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var react_dnd_1 = require("react-dnd");
var util_1 = require("./util");
var dragHandlers = {
    beginDrag: function (props) {
        return {
            draggableId: props.draggableId,
            index: props.index,
            item: props.data,
            parentDroppableId: props.parentDroppableId,
            type: props.type,
        };
    },
};
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    };
}
function DraggableInner(_a) {
    var canCopy = _a.canCopy, canDelete = _a.canDelete, canEdit = _a.canEdit, canPaste = _a.canPaste, children = _a.children, connectDragSource = _a.connectDragSource, data = _a.data, draggableItem = _a.draggableItem, editable = _a.editable, innerRef = _a.innerRef, isDragging = _a.isDragging, makeRoomForPlaceholder = _a.makeRoomForPlaceholder, onCopy = _a.onCopy, onDelete = _a.onDelete, onEdit = _a.onEdit, onPaste = _a.onPaste, orientation = _a.orientation, title = _a.title;
    return connectDragSource(react_1.default.createElement("div", { "data-draggable-component": true, ref: innerRef, className: classnames_1.default("dnd-draggable", {
            "placeholder-above": makeRoomForPlaceholder && orientation !== "horizontal",
            "placeholder-beside-left": makeRoomForPlaceholder && orientation === "horizontal",
        }) },
        children({ data: data, isDragging: isDragging }),
        editable && (react_1.default.createElement(util_1.DraggableEditButtons, { canCopy: canCopy, canDelete: canDelete, canEdit: canEdit, canPaste: canPaste, onCopy: onCopy && (function () { return onCopy(draggableItem); }), onDelete: onDelete && (function () { return onDelete(draggableItem); }), onEdit: onEdit && (function () { return onEdit(draggableItem); }), onPaste: onPaste && (function () { return onPaste(draggableItem); }), title: title }))));
}
var DraggableComponent = react_dnd_1.DragSource(function (_a) {
    var type = _a.type;
    return type;
}, dragHandlers, collect)(DraggableInner);
exports.Draggable = react_1.default.memo(function (_a) {
    var canCopy = _a.canCopy, canDelete = _a.canDelete, canEdit = _a.canEdit, canPaste = _a.canPaste, children = _a.children, data = _a.data, draggableId = _a.draggableId, editable = _a.editable, index = _a.index, onCopy = _a.onCopy, onDelete = _a.onDelete, onEdit = _a.onEdit, onPaste = _a.onPaste, title = _a.title, type = _a.type;
    var innerRef = react_1.default.useRef(null);
    var droppableContext = react_1.default.useContext(util_1.DroppableContext);
    var draggableContext = react_1.default.useContext(util_1.DraggableContext);
    var finalCanCopy = typeof canCopy !== "undefined"
        ? canCopy
        : draggableContext
            ? draggableContext.canCopy
            : void 0;
    var finalCanDelete = typeof canDelete !== "undefined"
        ? canDelete
        : draggableContext
            ? draggableContext.canDelete
            : void 0;
    var finalCanEdit = typeof canEdit !== "undefined"
        ? canEdit
        : draggableContext
            ? draggableContext.canEdit
            : void 0;
    var finalCanPaste = typeof canPaste !== "undefined"
        ? canPaste
        : draggableContext
            ? draggableContext.canPaste
            : void 0;
    var finalOnCopy = typeof onCopy !== "undefined" ? onCopy : draggableContext ? draggableContext.onCopy : void 0;
    var finalOnDelete = typeof onDelete !== "undefined"
        ? onDelete
        : draggableContext
            ? draggableContext.onDelete
            : void 0;
    var finalOnEdit = typeof onEdit !== "undefined" ? onEdit : draggableContext ? draggableContext.onEdit : void 0;
    var finalOnPaste = typeof onPaste !== "undefined"
        ? onPaste
        : draggableContext
            ? draggableContext.onPaste
            : void 0;
    var draggableItem = {
        draggableId: draggableId,
        index: index,
        item: data,
        parentDroppableId: droppableContext && droppableContext.droppableId,
        type: type,
    };
    return (react_1.default.createElement(DraggableComponent, { canCopy: finalCanCopy, canDelete: finalCanDelete, canEdit: finalCanEdit, canPaste: finalCanPaste, data: data, draggableId: draggableId, draggableItem: draggableItem, editable: editable, index: index, innerRef: innerRef, makeRoomForPlaceholder: !!droppableContext &&
            droppableContext.placeholder !== null &&
            droppableContext.placeholder.index <= index, onCopy: finalOnCopy, onDelete: finalOnDelete, onEdit: finalOnEdit, onPaste: finalOnPaste, orientation: (droppableContext && droppableContext.orientation) || "vertical", parentDroppableId: droppableContext && droppableContext.droppableId, title: title, type: type }, children));
}, util_1.shallowPropCheck(["data", "draggableId", "index", "type"]));
//# sourceMappingURL=Draggable.js.map