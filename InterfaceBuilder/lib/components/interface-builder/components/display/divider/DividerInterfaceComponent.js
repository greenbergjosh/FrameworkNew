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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var react_1 = __importDefault(require("react"));
var divider_manage_form_1 = require("./divider-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var DividerInterfaceComponent = /** @class */ (function (_super) {
    __extends(DividerInterfaceComponent, _super);
    function DividerInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DividerInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "divider",
            title: "Divider",
            icon: "line",
            componentDefinition: {
                component: "divider",
            },
        };
    };
    DividerInterfaceComponent.prototype.render = function () {
        var _a = this.props, dashed = _a.dashed, orientation = _a.orientation, text = _a.text, textAlignment = _a.textAlignment;
        return text ? (react_1.default.createElement(antd_1.Divider, { dashed: dashed, type: orientation, orientation: textAlignment }, text)) : (react_1.default.createElement(antd_1.Divider, { dashed: dashed, type: orientation, orientation: textAlignment }));
    };
    DividerInterfaceComponent.defaultProps = {
        defaultValue: 0,
    };
    DividerInterfaceComponent.manageForm = divider_manage_form_1.dividerManageForm;
    return DividerInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.DividerInterfaceComponent = DividerInterfaceComponent;
//# sourceMappingURL=DividerInterfaceComponent.js.map