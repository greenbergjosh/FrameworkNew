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
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var button_manage_form_1 = require("./button-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var ButtonInterfaceComponent = /** @class */ (function (_super) {
    __extends(ButtonInterfaceComponent, _super);
    function ButtonInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClick = function (_a) {
            var target = _a.target;
            var requireConfirmation = _this.props.requireConfirmation;
            var isShowingConfirmation = _this.state.isShowingConfirmation;
            if (requireConfirmation && !isShowingConfirmation) {
                _this.setState({ isShowingConfirmation: true });
            }
            else {
                // Do action
                console.log("ButtonInterfaceComponent.handleClick", "TODO: Perform action here");
                // Close Popup
                _this.setState({ isShowingConfirmation: false });
            }
        };
        _this.handleCloseConfirmation = function (_a) {
            var target = _a.target;
            if (_this.state.isShowingConfirmation) {
                _this.setState({ isShowingConfirmation: false });
            }
        };
        _this.handleConfirmationVisibleChange = function (visible) {
            _this.setState({ isShowingConfirmation: visible });
        };
        _this.state = {
            isShowingConfirmation: false,
        };
        return _this;
    }
    ButtonInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "button",
            title: "Button",
            icon: "play-circle",
            formControl: true,
            componentDefinition: {
                component: "button",
            },
        };
    };
    ButtonInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey, buttonLabel = _a.buttonLabel, icon = _a.icon, hideButtonLabel = _a.hideButtonLabel, shape = _a.shape, size = _a.size, displayType = _a.displayType, block = _a.block, ghost = _a.ghost, requireConfirmation = _a.requireConfirmation;
        var rawValue = fp_1.get(valueKey, userInterfaceData);
        var value = typeof rawValue !== "undefined" ? rawValue : defaultValue;
        var isCircle = shape === "circle" || shape === "circle-outline";
        var buttonShape = displayType !== "link" ? shape : undefined;
        // Merge any incoming confirmation properties on top of the defaults
        var confirmation = fp_1.merge(this.props.confirmation || {}, ButtonInterfaceComponent.getManageFormDefaults().confirmation);
        var content = (react_1.default.createElement(antd_1.Tooltip, { title: hideButtonLabel || isCircle ? buttonLabel : null },
            react_1.default.createElement(antd_1.Button, { onClick: this.handleClick, value: value, icon: icon, shape: buttonShape, size: size, type: displayType, block: block, ghost: ghost }, !hideButtonLabel && !isCircle ? buttonLabel : null)));
        return requireConfirmation ? (react_1.default.createElement(antd_1.Popover, { content: react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(antd_1.Typography.Paragraph, null, confirmation.message),
                react_1.default.createElement(antd_1.Row, null,
                    react_1.default.createElement(antd_1.Col, { span: 12 },
                        react_1.default.createElement(antd_1.Button, { block: true, onClick: this.handleCloseConfirmation }, confirmation.cancelText)),
                    react_1.default.createElement(antd_1.Col, { span: 12 },
                        react_1.default.createElement(antd_1.Button, { block: true, type: "danger", onClick: this.handleClick }, confirmation.okText)))), placement: "topRight", title: confirmation.title, trigger: "click", onVisibleChange: this.handleConfirmationVisibleChange, visible: this.state.isShowingConfirmation }, content)) : (content);
    };
    ButtonInterfaceComponent.defaultProps = {
        valueKey: "value",
    };
    ButtonInterfaceComponent.manageForm = button_manage_form_1.buttonManageForm;
    return ButtonInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.ButtonInterfaceComponent = ButtonInterfaceComponent;
//# sourceMappingURL=ButtonInterfaceComponent.js.map