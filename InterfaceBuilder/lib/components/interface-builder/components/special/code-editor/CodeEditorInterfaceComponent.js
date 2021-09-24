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
var Option_1 = require("fp-ts/lib/Option");
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var code_editor_1 = require("./code-editor");
var code_editor_manage_form_1 = require("./code-editor-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var CodeEditorInterfaceComponent = /** @class */ (function (_super) {
    __extends(CodeEditorInterfaceComponent, _super);
    function CodeEditorInterfaceComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (_a) {
            var newValue = _a.value;
            var _b = _this.props, defaultValue = _b.defaultValue, onChangeData = _b.onChangeData, userInterfaceData = _b.userInterfaceData, valueKey = _b.valueKey;
            var value = fp_1.get(valueKey, userInterfaceData) || defaultValue;
            if ((newValue || "") !== (value || "")) {
                onChangeData && onChangeData(fp_1.set(valueKey, newValue, userInterfaceData));
            }
        };
        return _this;
    }
    CodeEditorInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Special",
            name: "code-editor",
            title: "Code Editor",
            icon: "code",
            formControl: true,
            componentDefinition: {
                component: "code-editor",
                label: "Code Editor",
            },
        };
    };
    CodeEditorInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultLanguage = _a.defaultLanguage, defaultTheme = _a.defaultTheme, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        var value = fp_1.get(valueKey, userInterfaceData) || defaultValue;
        return (react_1.default.createElement(code_editor_1.CodeEditor, { content: value, contentDraft: Option_1.some(value), height: "400px", language: defaultLanguage, theme: defaultTheme, width: "100%", onChange: this.handleChange }));
    };
    CodeEditorInterfaceComponent.defaultProps = {
        valueKey: "code",
        defaultValue: "",
    };
    CodeEditorInterfaceComponent.manageForm = code_editor_manage_form_1.codeEditorManageForm;
    return CodeEditorInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.CodeEditorInterfaceComponent = CodeEditorInterfaceComponent;
//# sourceMappingURL=CodeEditorInterfaceComponent.js.map