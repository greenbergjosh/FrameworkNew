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
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var UserInterface_1 = require("../../../UserInterface");
var user_interface_manage_form_1 = require("./user-interface-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var UserInterfaceInterfaceComponent = /** @class */ (function (_super) {
    __extends(UserInterfaceInterfaceComponent, _super);
    function UserInterfaceInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChangeData = function (data) {
            _this.setState({ data: data });
        };
        _this.handleChangeSchema = function (schema) {
            var _a = _this.props, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            // console.log("UserInterfaceInterfaceComponent.handleChangeSchema", schema, onChangeData)
            onChangeData && onChangeData(fp_1.set(valueKey, schema, userInterfaceData));
        };
        _this.state = { data: props.defaultDataValue };
        return _this;
    }
    UserInterfaceInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Special",
            name: "user-interface",
            title: "Layout Creator",
            icon: "build",
            componentDefinition: {
                component: "user-interface",
                label: "Layout Creator",
            },
        };
    };
    UserInterfaceInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, mode = _a.mode, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        var data = this.state.data;
        return (react_1.default.createElement(UserInterface_1.UserInterface, { components: fp_1.get(valueKey, userInterfaceData) || defaultValue, data: data, mode: "edit", onChangeData: this.handleChangeData, onChangeSchema: this.handleChangeSchema }));
    };
    UserInterfaceInterfaceComponent.defaultProps = {
        defaultDataValue: {},
        defaultValue: [],
        mode: "edit",
        valueKey: "layout",
    };
    UserInterfaceInterfaceComponent.manageForm = user_interface_manage_form_1.userInterfaceManageForm;
    return UserInterfaceInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.UserInterfaceInterfaceComponent = UserInterfaceInterfaceComponent;
//# sourceMappingURL=UserInterfaceInterfaceComponent.js.map