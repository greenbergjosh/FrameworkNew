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
var empty_manage_form_1 = require("./empty-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var EmptyInterfaceComponent = /** @class */ (function (_super) {
    __extends(EmptyInterfaceComponent, _super);
    function EmptyInterfaceComponent(props) {
        return _super.call(this, props) || this;
    }
    EmptyInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "empty",
            title: "Empty",
            icon: "file-unknown",
            componentDefinition: {
                component: "empty",
                label: "Empty",
            },
        };
    };
    EmptyInterfaceComponent.prototype.render = function () {
        var _a = this.props, customImage = _a.customImage, image = _a.image, message = _a.message;
        //
        return (react_1.default.createElement(antd_1.Empty, { description: message, image: image === "default"
                ? antd_1.Empty.PRESENTED_IMAGE_DEFAULT
                : image === "compact"
                    ? antd_1.Empty.PRESENTED_IMAGE_SIMPLE
                    : image === "custom"
                        ? customImage
                        : image }));
    };
    EmptyInterfaceComponent.manageForm = empty_manage_form_1.emptyManageForm;
    return EmptyInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.EmptyInterfaceComponent = EmptyInterfaceComponent;
//# sourceMappingURL=EmptyInterfaceComponent.js.map