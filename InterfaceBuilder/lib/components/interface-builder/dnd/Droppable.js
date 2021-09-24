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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var react_dnd_1 = require("react-dnd");
var util_1 = require("./util");
var dropHandlers = {
    // canDrop(props: DroppableInnerProps) {
    //   return props.allowDrop !== false
    // },
    hover: function (props, monitor, component) {
        var item = monitor.getItem();
        var draggedIndex = item.index, draggableId = item.draggableId, parentDroppableId = item.parentDroppableId;
        var allowDrop = props.allowDrop, droppableElement = props.innerRef.current, placeholder = props.placeholder, droppableId = props.droppableId;
        if (droppableElement && allowDrop) {
            // Determine the child element being hovered over
            var clientOffset = monitor.getClientOffset();
            var hoverElement_1 = util_1.findDraggableOrPlaceholder(droppableElement, clientOffset);
            if (hoverElement_1) {
                if (util_1.isPlaceholderElement(hoverElement_1))
                    return;
                var simpleHoverIndex = __spread(droppableElement.children).findIndex(function (child) { return child === hoverElement_1; });
                var isHoveringOriginal = draggedIndex === simpleHoverIndex && parentDroppableId === droppableId;
                if (!isHoveringOriginal) {
                    // find the middle of things
                    var hoverBoundingRect = hoverElement_1.getBoundingClientRect();
                    var hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
                    var hoverClientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0;
                    var hoveredIndex = hoverClientY > hoverMiddleY ? simpleHoverIndex + 1 : simpleHoverIndex;
                    // Don't adjust until we are halfway over the Draggable
                    if (draggedIndex < hoveredIndex && hoverClientY < hoverMiddleY)
                        return;
                    if (draggedIndex > hoveredIndex && hoverClientY > hoverMiddleY)
                        return;
                    // If the adjusted index would put this item back into the same place it was pulled from
                    // then don't
                    if (draggedIndex === hoveredIndex && parentDroppableId === droppableId)
                        return;
                    var droppableBoundingRect = droppableElement.getBoundingClientRect();
                    if (hoveredIndex >= droppableElement.children.length - (placeholder ? 1 : 0)) {
                        var finalHoverElement = droppableElement.children.item(droppableElement.children.length - (placeholder ? 2 : 1));
                        if (finalHoverElement) {
                            var finalHoverBoundingRect = finalHoverElement.getBoundingClientRect();
                            // insert a display placeholder at an appropriate position
                            // const dragDir = draggedIndex > hoveredIndex ? "up" : "down"
                            var newPlaceholder = {
                                index: hoveredIndex,
                                x: finalHoverBoundingRect.left - droppableBoundingRect.left + 5,
                                y: finalHoverBoundingRect.bottom - droppableBoundingRect.top + 10,
                                width: finalHoverBoundingRect.width - 10,
                            };
                            // Don't update the state unless the state has actually changed
                            if (!util_1.isShallowEqual(newPlaceholder, placeholder)) {
                                // console.log("Droppable.hover", "result", { newPlaceholder, finalHoverElement })
                                props.setPlaceholder(newPlaceholder);
                            }
                            else {
                                // console.log("Droppable.hover", "result", "Do Nothing")
                            }
                        }
                        else {
                            // console.log("Droppable.hover", "result", "Do Nothing")
                        }
                        return;
                    }
                    else {
                        var finalHoverElement = droppableElement.children.item(hoveredIndex);
                        if (finalHoverElement) {
                            var finalHoverBoundingRect = finalHoverElement.getBoundingClientRect();
                            // insert a display placeholder at an appropriate position
                            var newPlaceholder = {
                                index: hoveredIndex,
                                x: finalHoverBoundingRect.left - droppableBoundingRect.left + 5,
                                y: finalHoverBoundingRect.top - droppableBoundingRect.top + 5,
                                width: finalHoverBoundingRect.width - 10,
                            };
                            // Don't update the state unless the state has actually changed
                            if (!util_1.isShallowEqual(newPlaceholder, placeholder)) {
                                // console.log("Droppable.hover", "result", { newPlaceholder })
                                props.setPlaceholder(newPlaceholder);
                            }
                            else {
                                // console.log("Droppable.hover", "result", "Do Nothing")
                            }
                        }
                        else {
                            // console.log("Droppable.hover", "result", "Do Nothing")
                        }
                        return;
                    }
                }
                else {
                    // If we're hovering the original item, don't show a placeholder
                }
            }
            else {
                // Not hovrering any particular element, placeholder should go to the top or bottom
                // Determine bounds of Droppable
                var droppableBoundingRect = droppableElement.getBoundingClientRect();
                // Determine pointer position
                var clientOffset_1 = monitor.getClientOffset();
                if (clientOffset_1) {
                    // If we're close to the top
                    if (clientOffset_1.y - droppableBoundingRect.top < 30) {
                        var hoveredIndex = 0;
                        // If this was already the top item in this list, then bail
                        if (draggedIndex === hoveredIndex && parentDroppableId === droppableId)
                            return;
                        // Simulate hovering the 0th item
                        var fauxHoveredElement = droppableElement.children.item(hoveredIndex);
                        if (fauxHoveredElement && !util_1.isPlaceholderElement(fauxHoveredElement)) {
                            var hoverBoundingRect = fauxHoveredElement.getBoundingClientRect();
                            var newPlaceholder = {
                                index: hoveredIndex,
                                x: hoverBoundingRect.left - droppableBoundingRect.left + 5,
                                y: hoverBoundingRect.top - droppableBoundingRect.top + 5,
                                width: hoverBoundingRect.width - 10,
                            };
                            // Don't update the state unless the state has actually changed
                            if (!util_1.isShallowEqual(newPlaceholder, placeholder)) {
                                // console.log("Droppable.hover", "result", { newPlaceholder })
                                props.setPlaceholder(newPlaceholder);
                            }
                            else {
                                // console.log("Droppable.hover", "result", "Do Nothing")
                            }
                            return;
                        }
                    }
                    // If we're close to the bottom
                    else if (droppableBoundingRect.bottom - clientOffset_1.y < (placeholder ? 130 : 30)) {
                        var hoveredIndex = droppableElement.children.length - (placeholder ? 1 : 0);
                        // If this was already the bottom item in this list, then bail
                        if ((draggedIndex === hoveredIndex ||
                            (draggedIndex === hoveredIndex - 1 &&
                                hoveredIndex === droppableElement.children.length)) &&
                            parentDroppableId === droppableId)
                            return;
                        // Simulate hovering the last item
                        var fauxHoveredElement = droppableElement.children.item(hoveredIndex - 1);
                        if (fauxHoveredElement && !util_1.isPlaceholderElement(fauxHoveredElement)) {
                            var hoverBoundingRect = fauxHoveredElement.getBoundingClientRect();
                            var newPlaceholder = {
                                index: hoveredIndex,
                                x: hoverBoundingRect.left - droppableBoundingRect.left + 5,
                                y: hoverBoundingRect.bottom - droppableBoundingRect.top + 10,
                                width: hoverBoundingRect.width - 10,
                            };
                            // Don't update the state unless the state has actually changed
                            if (!util_1.isShallowEqual(newPlaceholder, placeholder)) {
                                // console.log("Droppable.hover", "result", { newPlaceholder, fauxHoveredElement })
                                props.setPlaceholder(newPlaceholder);
                            }
                            else {
                                // console.log("Droppable.hover", "result", "Do Nothing")
                            }
                            return;
                        }
                    }
                }
            }
        }
        else {
            // If there's no Droppable element
        }
        if (placeholder !== null) {
            // console.log("Droppable.hover", "result", "Remove placeholder")
            props.setPlaceholder(null);
        }
        else {
            // console.log("Droppable.hover", "result", "Do Nothing")
        }
    },
    drop: function (props, monitor) {
        // Just in case this drop has already been dropped
        if (monitor.didDrop())
            return;
        // Get the item that was being dragged from the monitory
        var droppedItem = monitor.getItem();
        var disabled = props.disabled, droppableId = props.droppableId, innerRef = props.innerRef, onDrop = props.onDrop, placeholder = props.placeholder, setPlaceholder = props.setPlaceholder, type = props.type;
        // If there is a specified onDrop on the props or in the ancestor chain
        if (onDrop) {
            var dropIndex = 0;
            if (placeholder && typeof placeholder.index === "number" && !isNaN(placeholder.index)) {
                dropIndex = placeholder.index;
            }
            else if (innerRef.current) {
                dropIndex = innerRef.current.children.length;
            }
            // Invoke the drop handler with the dropped item and a few of this droppable's props
            onDrop(droppedItem, {
                disabled: !!disabled,
                droppableId: droppableId,
                dropIndex: dropIndex,
                type: type,
            });
        }
        // Regardless of the validity of the drop, clear the placeholder
        setPlaceholder(null);
        return props;
    },
};
function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
    };
}
function DroppableInner(_a) {
    var allowDrop = _a.allowDrop, canDrop = _a.canDrop, children = _a.children, connectDropTarget = _a.connectDropTarget, droppableId = _a.droppableId, innerRef = _a.innerRef, isOver = _a.isOver, _b = _a.orientation, orientation = _b === void 0 ? "vertical" : _b, placeholder = _a.placeholder, placeholderText = _a.placeholderText, setPlaceholder = _a.setPlaceholder;
    var childrenResult = children({ isOver: isOver });
    var childCount = Array.isArray(childrenResult) ? childrenResult.length : 1;
    var emptyContainer = childCount === 0;
    // console.log("DroppableInner.render", { childrenResult, childCount })
    var horizontal = orientation === "horizontal";
    return connectDropTarget(react_1.default.createElement("div", { "data-droppable-component": true, className: classnames_1.default("dnd-droppable", {
            "accept-drop": canDrop && isOver && allowDrop,
            "has-placeholder": !!placeholder && canDrop && isOver && allowDrop,
            vertical: !horizontal,
            horizontal: horizontal,
        }), ref: innerRef },
        childrenResult,
        allowDrop && ((placeholder && isOver) || emptyContainer) && (react_1.default.createElement(util_1.DroppablePlaceholder, { emptyContainer: emptyContainer, horizontal: horizontal, text: placeholderText, x: (placeholder || { x: 5 }).x, y: (placeholder || { y: 5 }).y, width: (placeholder || { width: "95%" }).width }))));
}
var DroppableComponent = react_dnd_1.DropTarget(function (_a) {
    var type = _a.type;
    return type;
}, dropHandlers, collect)(DroppableInner);
exports.Droppable = react_1.default.memo(function (_a) {
    var _b = _a.allowDrop, allowDrop = _b === void 0 ? true : _b, children = _a.children, disabled = _a.disabled, droppableId = _a.droppableId, onDrop = _a.onDrop, orientation = _a.orientation, placeholderText = _a.placeholderText, type = _a.type;
    var innerRef = react_1.default.useRef(null);
    console.log("Droppable.memo.render");
    var _c = __read(react_1.default.useState(null), 2), placeholder = _c[0], setPlaceholder = _c[1];
    var parentDroppableContext = react_1.default.useContext(util_1.DroppableContext);
    var finalDropHandler = onDrop || (parentDroppableContext ? parentDroppableContext.onDrop : void 0);
    return (react_1.default.createElement(util_1.DroppableContext.Provider, { value: { droppableId: droppableId, onDrop: finalDropHandler, orientation: orientation, placeholder: placeholder } },
        react_1.default.createElement(DroppableComponent, { allowDrop: allowDrop, disabled: disabled, droppableId: droppableId, innerRef: innerRef, onDrop: finalDropHandler, orientation: orientation, placeholder: placeholder, setPlaceholder: setPlaceholder, placeholderText: placeholderText, type: type }, children)));
}, util_1.shallowPropCheck(["allowDrop", "data", "disabled", "droppableId", "type"]));
//# sourceMappingURL=Droppable.js.map