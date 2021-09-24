"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
exports.DroppablePlaceholder = react_1.default.memo(function (_a) {
    var className = _a.className, emptyContainer = _a.emptyContainer, horizontal = _a.horizontal, text = _a.text, width = _a.width, x = _a.x, y = _a.y;
    return (react_1.default.createElement("div", { "data-droppable-placeholder": true, className: classnames_1.default("droppable-placeholder", className, {
            "empty-container": emptyContainer,
            vertical: !horizontal,
            horizontal: horizontal,
        }), style: emptyContainer
            ? {}
            : {
                // TODO: Figure out replacing with transform instead of top and left
                // transform: `translate(
                //   ${(placeholder || { y: 0 }).y}px,
                // ${(placeholder || { x: 0 }).x})px`,
                top: y + "px",
                left: x + "px",
                width: typeof width === "number" ? width + "px" : width,
            } }, text || "Drop Item Here"));
});
//# sourceMappingURL=DroppablePlaceholder.js.map