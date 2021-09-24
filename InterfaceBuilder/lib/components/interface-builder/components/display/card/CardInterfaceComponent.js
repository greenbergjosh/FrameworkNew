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
var DataPathContext_1 = require("../../../util/DataPathContext");
var ComponentRenderer_1 = require("../../../ComponentRenderer");
var card_manage_form_1 = require("./card-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var CardInterfaceComponent = /** @class */ (function (_super) {
    __extends(CardInterfaceComponent, _super);
    function CardInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CardInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "card",
            title: "Card",
            icon: "profile",
            componentDefinition: {
                component: "card",
                components: [],
            },
        };
    };
    CardInterfaceComponent.prototype.render = function () {
        var _a = this.props, bordered = _a.bordered, components = _a.components, extra = _a.extra, hoverable = _a.hoverable, inset = _a.inset, onChangeData = _a.onChangeData, preconfigured = _a.preconfigured, size = _a.size, title = _a.title, userInterfaceData = _a.userInterfaceData;
        return (react_1.default.createElement(antd_1.Card, { bordered: bordered, className: "ui-card", extra: extra, hoverable: hoverable, size: size, title: title, type: inset ? "inner" : undefined },
            react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "components" },
                react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: components || [], data: userInterfaceData, dragDropDisabled: !!preconfigured, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                        console.warn("CardInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in Card", { newSchema: newSchema });
                    } }))));
    };
    CardInterfaceComponent.manageForm = card_manage_form_1.cardManageForm;
    return CardInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.CardInterfaceComponent = CardInterfaceComponent;
//# sourceMappingURL=CardInterfaceComponent.js.map