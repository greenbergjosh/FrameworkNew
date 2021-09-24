"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_component_1 = __importDefault(require("@reach/component-component"));
var antd_1 = require("antd");
var Option_1 = require("fp-ts/lib/Option");
var iots = __importStar(require("io-ts"));
var monaco_editor_1 = require("monaco-editor");
var react_1 = __importDefault(require("react"));
var react_monaco_editor_1 = __importStar(require("react-monaco-editor"));
var Option_2 = require("../../../lib/Option");
exports.editorLanguages = {
    csharp: "csharp",
    json: "json",
    javascript: "javascript",
    typescript: "typescript",
    sql: "sql",
};
exports.EditorLangCodec = iots.keyof(exports.editorLanguages);
/*******************************
 * Constants
 */
var willMountRegistry = [];
exports.registerMonacoEditorMount = function (customEditorWillMount) {
    willMountRegistry.push(customEditorWillMount);
};
exports.activeEditorSettings = {
    cursorBlinking: "blink",
    cursorSmoothCaretAnimation: false,
    cursorStyle: "block",
    extraEditorClassName: "",
    fixedOverflowWidgets: false,
    glyphMargin: false,
    lineDecorationsWidth: 10,
    lineNumbers: "on",
    lineNumbersMinChars: 4,
    minimap: {
        enabled: false,
    },
    mouseWheelZoom: false,
    overviewRulerBorder: false,
    overviewRulerLanes: 2,
    quickSuggestions: {
        comments: true,
        other: true,
        strings: true,
    },
    readOnly: false,
    renderFinalNewline: true,
    renderLineHighlight: "none",
    revealHorizontalRightPadding: 30,
    roundedSelection: true,
    rulers: [],
    scrollBeyondLastLine: false,
    selectionClipboard: true,
    selectOnLineNumbers: true,
    showUnused: true,
    snippetSuggestions: "none",
    // @ts-ignore
    wordBasedSuggestions: false,
    wordWrap: "off",
    wordWrapColumn: 80,
    wrappingIndent: "same",
};
var inactiveEditorSettings = __assign(__assign({}, exports.activeEditorSettings), { readOnly: true });
var diffEditorSettings = __assign(__assign({}, exports.activeEditorSettings), { renderSideBySide: true });
// function editorWillMount(monaco: typeof monacoEditor) {
//   const adapter = new GUIDEditorServiceAdapter(monaco)
//   monaco.languages.registerLinkProvider("json", adapter)
//   monaco.languages.registerHoverProvider("json", adapter)
// }
/*******************************
 * CodeEditor Component
 */
exports.CodeEditor = react_1.default.memo(function CodeEditor(props) {
    var _a = __read(react_1.default.useState({
        showDiff: false,
        monaco: null,
    }), 2), state = _a[0], setState = _a[1];
    var editorProps = react_1.default.useMemo(function () {
        return props.contentDraft.foldL(Option_2.None(function () { return ({
            defaultValue: props.content,
            options: inactiveEditorSettings,
            original: props.content,
            value: props.content,
        }); }), Option_2.Some(function (contentDraft) { return ({
            defaultValue: contentDraft,
            options: diffEditorSettings,
            original: props.content,
            value: contentDraft,
        }); }));
    }, [props.content, props.contentDraft]);
    var onChange = function (draft) {
        if (props.onChange) {
            return props.onChange({ value: draft, errors: Option_1.none });
        }
    };
    var handleEditorWillMount = react_1.default.useCallback(function (monaco, setLocalState) {
        var disposables = willMountRegistry.reduce(function (acc, customEditorWillMount) { return __spread(acc, customEditorWillMount(monaco)); }, []);
        //@ts-ignore
        if (!monaco.editor.setModelMarkers._monkeyPatched) {
            var oldSetModelMarkers_1 = monaco.editor.setModelMarkers;
            monaco.editor.setModelMarkers = function (model, language, markers) {
                oldSetModelMarkers_1.call(monaco.editor, model, language, markers);
                var errors = markers
                    .filter(function (marker) { return marker.severity === monaco_editor_1.MarkerSeverity.Error; })
                    .map(function (marker) {
                    return marker.message + " on line " + marker.startLineNumber + ":" + marker.startColumn;
                });
                if (props.onChange) {
                    props.onChange({
                        value: model.getValue(),
                        errors: Option_1.some(errors),
                    });
                }
            };
            //@ts-ignore
            monaco.editor.setModelMarkers._monkeyPatched = true;
        }
        setLocalState({ disposables: disposables });
        setState(__assign(__assign({}, state), { monaco: monaco }));
    }, [willMountRegistry, state, setState]);
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(antd_1.Card, { bodyStyle: { display: "none" }, bordered: false, cover: react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(antd_1.Button.Group, { size: "small" },
                    react_1.default.createElement(antd_1.Button, { title: "show diff", type: state.showDiff ? "primary" : "default", onClick: function () { return setState(__assign(__assign({}, state), { showDiff: !state.showDiff })); } },
                        react_1.default.createElement(antd_1.Icon, { theme: "filled", type: "diff" })),
                    react_1.default.createElement(antd_1.Button, { disabled: true }, props.language)),
                state.showDiff ? (react_1.default.createElement(react_monaco_editor_1.MonacoDiffEditor, __assign({ theme: "vs-dark" }, props, editorProps, { onChange: onChange }))) : (react_1.default.createElement(component_component_1.default, { initialState: { disposables: [] }, willUnmount: function (_a) {
                        var state = _a.state;
                        return state.disposables.forEach(function (f) { return f.dispose(); });
                    } }, function (_a) {
                    var setLocalState = _a.setState;
                    return (react_1.default.createElement(react_monaco_editor_1.default, __assign({ theme: "vs-dark" }, props, editorProps, { onChange: onChange, editorWillMount: function (monaco) { return handleEditorWillMount(monaco, setLocalState); } })));
                }))), size: "default", type: "inner" })));
});
//# sourceMappingURL=code-editor.js.map