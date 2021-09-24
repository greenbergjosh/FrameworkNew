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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var antd_1 = require("antd");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var selectable_1 = require("../../_shared/selectable");
var menu_manage_form_1 = require("./menu-manage-form");
var menu_scss_1 = __importDefault(require("./menu.scss"));
/******************************
 * Component
 */
var MenuInterfaceComponent = /** @class */ (function (_super) {
    __extends(MenuInterfaceComponent, _super);
    function MenuInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleMenuClick = function (_a) {
            var key = _a.key;
            _this.setState({ selectedKey: key });
            console.log("handleMenuClick!", key);
        };
        _this.handleButtonClick = function (e) {
            // this.setState({ selectedKey: key })
            console.log("handleButtonClick!", e);
        };
        _this.handleInputChange = function (_a) {
            var target = _a.target;
            _this.setState({ searchText: target.value });
            console.log("handleChange!", target.value);
        };
        /****************************************************************
         * Define this component's render for Selectable to call
         * so Selectable can pass in Selectable state and props.
         * Props must implement SelectableChildProps interface.
         */
        _this.renderMenu = function (_a) {
            var disabled = _a.disabled, getCleanValue = _a.getCleanValue, loadError = _a.loadError, loadStatus = _a.loadStatus, options = _a.options;
            var searchPlaceholder = _this.props.searchPlaceholder;
            var selectedKey = _this.state.selectedKey;
            //TODO: What to do with this?
            var getKeyFromValue = function () {
                var value = getCleanValue();
                return value && value.toString();
            };
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(antd_1.Input, { className: menu_scss_1.default.menuFilter, placeholder: searchPlaceholder, onChange: _this.handleInputChange, allowClear: true }),
                react_1.default.createElement(antd_1.Typography.Text, { type: "secondary", ellipsis: true },
                    "Selected:\u00A0",
                    selectedKey,
                    selectedKey && (react_1.default.createElement(antd_1.Button, { type: "link", shape: "circle", size: "small", icon: "close-circle", onClick: _this.handleButtonClick }))),
                react_1.default.createElement(antd_1.Skeleton, { active: true, loading: loadStatus === "loading" },
                    react_1.default.createElement(antd_1.Menu, { onClick: _this.handleMenuClick }, options.map(function (option, index) { return (react_1.default.createElement(antd_1.Menu.Item, { key: "item" + index + "|" + option.value, disabled: disabled },
                        typeof option.icon !== "undefined" ? (react_1.default.createElement(antd_1.Icon, { type: option.icon, className: menu_scss_1.default.menuItemIcon })) : null,
                        option.label)); })),
                    !loadError && (options && options.length > 0) ? null : (react_1.default.createElement(antd_1.Empty, { image: antd_1.Empty.PRESENTED_IMAGE_SIMPLE })))));
        };
        _this.state = {};
        return _this;
    }
    MenuInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "menu",
            title: "Menu",
            icon: "menu",
            componentDefinition: {
                component: "menu",
            },
        };
    };
    MenuInterfaceComponent.prototype.render = function () {
        return (
        // Since props is a union of IMenuProps and SelectableProps, we cast as SelectableProps
        react_1.default.createElement(selectable_1.Selectable, __assign({}, this.props), this.renderMenu));
    };
    MenuInterfaceComponent.defaultProps = {
        allowClear: true,
        createNewLabel: "Create New...",
        defaultValue: [],
        multiple: false,
        searchPlaceholder: "Search...",
        valueKey: "value",
        valuePrefix: "",
        valueSuffix: "",
    };
    MenuInterfaceComponent.manageForm = menu_manage_form_1.menuManageForm;
    return MenuInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.MenuInterfaceComponent = MenuInterfaceComponent;
//# sourceMappingURL=MenuInterfaceComponent.js.map