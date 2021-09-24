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
var antd_1 = require("antd");
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var ComponentRenderer_1 = require("../../ComponentRenderer");
var DataPathContext_1 = require("../../util/DataPathContext");
var form_manage_form_1 = require("./form-manage-form");
var BaseInterfaceComponent_1 = require("../base/BaseInterfaceComponent");
var defaultFormLayout = {
    labelCol: {
        sm: { span: 24 },
        md: { span: 8 },
        lg: { span: 6 },
        xl: { span: 5 },
    },
    wrapperCol: {
        sm: { span: 24 },
        md: { span: 16 },
        lg: { span: 18 },
        xl: { span: 19 },
    },
};
var FormInterfaceComponent = /** @class */ (function (_super) {
    __extends(FormInterfaceComponent, _super);
    function FormInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FormInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "form",
            title: "Form",
            icon: "form",
            componentDefinition: {
                component: "form",
                label: "Form",
                components: [],
            },
        };
    };
    FormInterfaceComponent.prototype.render = function () {
        var _this = this;
        var _a = this.props, components = _a.components, formColumnLayout = _a.formColumnLayout, onChangeData = _a.onChangeData, orientation = _a.orientation, userInterfaceData = _a.userInterfaceData;
        var formLayout = formColumnLayout
            ? fp_1.merge(defaultFormLayout, formColumnLayout)
            : defaultFormLayout;
        return (react_1.default.createElement(antd_1.Form, __assign({ style: { padding: "5px" }, layout: orientation }, formLayout),
            react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "components" },
                react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: components || [], data: userInterfaceData, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                        if (_this.props.mode === "edit") {
                            var _a = _this.props, onChangeSchema = _a.onChangeSchema, userInterfaceSchema = _a.userInterfaceSchema;
                            console.warn("FormInterfaceComponent.render", {
                                newSchema: newSchema,
                                onChangeSchema: _this.props.onChangeSchema,
                                userInterfaceSchema: _this.props.userInterfaceSchema,
                            });
                            onChangeSchema &&
                                userInterfaceSchema &&
                                onChangeSchema(fp_1.set("components", newSchema, userInterfaceSchema));
                        }
                    } }))));
    };
    FormInterfaceComponent.manageForm = form_manage_form_1.formManageForm;
    return FormInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.FormInterfaceComponent = FormInterfaceComponent;
//# sourceMappingURL=FormInterfaceComponent.js.map