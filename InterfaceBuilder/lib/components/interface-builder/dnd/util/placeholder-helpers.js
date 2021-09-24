"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findDraggableOrPlaceholder(parentElement, clientOffset) {
    if (clientOffset) {
        var cursorOverElement = document.elementFromPoint(clientOffset.x, clientOffset.y);
        var draggable = null;
        var droppable = null;
        var current = cursorOverElement;
        while (current && !droppable) {
            if (current.hasAttribute("data-draggable-component")) {
                draggable = current;
            }
            else if (current.hasAttribute("data-droppable-component")) {
                droppable = current;
            }
            else if (current.hasAttribute("data-droppable-placeholder")) {
                draggable = current;
            }
            current = current.parentElement;
        }
        if (draggable && droppable === parentElement) {
            return draggable;
        }
        return null;
    }
}
exports.findDraggableOrPlaceholder = findDraggableOrPlaceholder;
function isPlaceholderElement(element) {
    return element.hasAttribute("data-droppable-placeholder");
}
exports.isPlaceholderElement = isPlaceholderElement;
//# sourceMappingURL=placeholder-helpers.js.map