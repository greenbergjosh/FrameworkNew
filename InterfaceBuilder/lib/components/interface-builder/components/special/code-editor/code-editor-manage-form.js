"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_component_form_1 = require("../../base/base-component-form");
var supportedEditorLang = [
    { label: "C#", value: "csharp" },
    { label: "JavaScript", value: "javascript" },
    { label: "JSON", value: "json" },
    { label: "TypeScript", value: "typescript" },
    { label: "SQL", value: "sql" },
];
var supportedEditorTheme = [
    { label: "VS", value: "vs" },
    { label: "VS Dark", value: "vs-dark" },
    { label: "High Contrast Dark", value: "hc-black" },
];
exports.codeEditorManageForm = function () {
    var extend = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        extend[_i] = arguments[_i];
    }
    return base_component_form_1.baseManageForm.apply(void 0, __spread(codeEditorFormDefinition, extend));
};
var codeEditorFormDefinition = [
    {
        key: "base",
        components: [
            {
                key: "tabs",
                tabs: [
                    {
                        key: "data",
                        components: [
                            {
                                key: "label",
                                defaultValue: "Code Editor",
                            },
                            {
                                key: "valueKey",
                                defaultValue: "code",
                            },
                            {
                                key: "defaultValue",
                                valueKey: "defaultValue",
                                component: "code-editor",
                                defaultTheme: "vs-dark",
                                label: "Default Value",
                            },
                        ],
                    },
                    {
                        label: "Code",
                        key: "code",
                        components: [
                            // {
                            //   key: "allowDiffView",
                            //   valueKey: "allowDiffView",
                            //   component: "checkbox",
                            //   defaultValue: true,
                            //   help: "Let's the user open a side-by-side comparison of the old and new values",
                            //   label: "Allow Diff Viewer Option",
                            // },
                            {
                                key: "defaultLanguage",
                                valueKey: "defaultLanguage",
                                component: "select",
                                defaultValue: "json",
                                label: "Default Language",
                                help: "Select the code language to initially set for this code editor",
                                dataHandlerType: "local",
                                data: {
                                    values: supportedEditorLang,
                                },
                            },
                            // {
                            //   key: "allowLangSelect",
                            //   valueKey: "allowLangSelect",
                            //   component: "checkbox",
                            //   defaultValue: true,
                            //   label: "Allow Language Selection",
                            // },
                            {
                                key: "defaultTheme",
                                valueKey: "defaultTheme",
                                component: "select",
                                defaultValue: "vs",
                                label: "Default Theme",
                                help: "Select the highlighting theme to initially set for this code editor",
                                dataHandlerType: "local",
                                data: {
                                    values: supportedEditorTheme,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=code-editor-manage-form.js.map