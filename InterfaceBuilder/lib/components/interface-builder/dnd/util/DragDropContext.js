"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_dnd_1 = require("react-dnd");
var react_dnd_html5_backend_1 = __importDefault(require("react-dnd-html5-backend"));
var react_dnd_touch_backend_1 = __importDefault(require("react-dnd-touch-backend"));
var DragAndDropHOC = function (props) {
    return react_1.default.createElement(react_1.default.Fragment, null, props.children);
};
exports.default = {
    HTML5: react_dnd_1.DragDropContext(react_dnd_html5_backend_1.default)(DragAndDropHOC),
    //@ts-ignore
    Touch: react_dnd_1.DragDropContext(react_dnd_touch_backend_1.default)(DragAndDropHOC),
};
//# sourceMappingURL=DragDropContext.js.map