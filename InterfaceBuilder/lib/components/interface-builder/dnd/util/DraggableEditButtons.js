"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var react_1 = __importDefault(require("react"));
var confirmable_delete_1 = require("../../../button/confirmable-delete");
exports.DraggableEditButtons = function (_a) {
    var _b = _a.canCopy, canCopy = _b === void 0 ? true : _b, _c = _a.canDelete, canDelete = _c === void 0 ? true : _c, _d = _a.canEdit, canEdit = _d === void 0 ? true : _d, _e = _a.canPaste, canPaste = _e === void 0 ? false : _e, onCopy = _a.onCopy, onDelete = _a.onDelete, onEdit = _a.onEdit, onPaste = _a.onPaste, title = _a.title;
    console.log("DraggableEditButton.render", {
        canCopy: canCopy,
        canDelete: canDelete,
        canEdit: canEdit,
        canPaste: canPaste,
        onCopy: onCopy,
        onDelete: onDelete,
        onEdit: onEdit,
        onPaste: onPaste,
        title: title,
    });
    return (react_1.default.createElement("div", { className: "dnd-draggable-edit-buttons" },
        title && react_1.default.createElement("span", { className: "dnd-draggable-edit-title" }, title),
        react_1.default.createElement(antd_1.Button.Group, null,
            onEdit && canEdit && react_1.default.createElement(antd_1.Button, { icon: "edit", onClick: onEdit }),
            onPaste && canPaste && react_1.default.createElement(antd_1.Button, { icon: "snippets", onClick: onPaste, disabled: true }),
            onCopy && canCopy && react_1.default.createElement(antd_1.Button, { icon: "copy", onClick: onCopy, disabled: true }),
            onDelete && canDelete && (react_1.default.createElement(confirmable_delete_1.ConfirmableDeleteButton, { confirmationMessage: "Are you sure want to delete this " + (title || "item") + "?", confirmationTitle: "Confirm Delete", onDelete: onDelete })))));
};
//# sourceMappingURL=DraggableEditButtons.js.map