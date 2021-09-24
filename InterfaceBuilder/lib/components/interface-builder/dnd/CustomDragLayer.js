"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_dnd_1 = require("react-dnd");
var layerStyles = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 100,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};
var _CustomDragLayer = function (props) {
    var item = props.item, itemType = props.itemType, isDragging = props.isDragging;
    // console.log("_CustomDragLayer.render", props)
    function renderItem() {
        switch (itemType) {
            case "INTERFACE_COMPONENT":
                return react_1.default.createElement("div", null, "TEST");
            default:
                return react_1.default.createElement("div", null, "FAIL");
        }
    }
    if (!isDragging) {
        return null;
    }
    return (react_1.default.createElement("div", { style: layerStyles },
        react_1.default.createElement("div", null, renderItem())));
};
exports.CustomDragLayer = react_dnd_1.DragLayer(function (monitor) { return ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
}); })(_CustomDragLayer);
//# sourceMappingURL=CustomDragLayer.js.map