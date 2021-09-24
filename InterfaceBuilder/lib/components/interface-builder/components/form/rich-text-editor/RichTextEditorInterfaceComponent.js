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
var ckeditor4_react_1 = __importDefault(require("ckeditor4-react"));
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var rich_text_editor_manage_form_1 = require("./rich-text-editor-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
ckeditor4_react_1.default.editorUrl = "https://cdn.ckeditor.com/4.12.1/full-all/ckeditor.js";
var RichTextEditorInterfaceComponent = /** @class */ (function (_super) {
    __extends(RichTextEditorInterfaceComponent, _super);
    function RichTextEditorInterfaceComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (evt) {
            var value = evt.editor.getData();
            var _a = _this.props, onChangeData = _a.onChangeData, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
            onChangeData && onChangeData(fp_1.set(valueKey, value, userInterfaceData));
        };
        return _this;
    }
    RichTextEditorInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "rich-text-editor",
            title: "Rich Text Editor",
            icon: "form",
            formControl: true,
            componentDefinition: {
                component: "rich-text-editor",
                label: "Rich Text",
            },
        };
    };
    RichTextEditorInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultValue = _a.defaultValue, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        var rawValue = fp_1.get(valueKey, userInterfaceData);
        var value = typeof rawValue !== "undefined" ? rawValue : defaultValue;
        return (react_1.default.createElement(ckeditor4_react_1.default, { onChange: this.handleChange, data: value, 
            // Suppresses Error: 'react Error code: editor-element-conflict. editorName: "editor1"'
            onBeforeLoad: function (CKEditor) { return (CKEditor.disableAutoInline = true); } }));
    };
    RichTextEditorInterfaceComponent.defaultProps = {
        valueKey: "value",
        defaultValue: "",
        placeholder: "Enter text",
    };
    RichTextEditorInterfaceComponent.manageForm = rich_text_editor_manage_form_1.richTextEditorManageForm;
    return RichTextEditorInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.RichTextEditorInterfaceComponent = RichTextEditorInterfaceComponent;
//# sourceMappingURL=RichTextEditorInterfaceComponent.js.map