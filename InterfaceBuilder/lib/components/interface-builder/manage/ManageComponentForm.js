"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var ComponentRenderer_1 = require("../ComponentRenderer");
exports.ManageComponentForm = function (_a) {
    var componentDefinition = _a.componentDefinition, manageForm = _a.manageForm, onChangeDefinition = _a.onChangeDefinition;
    return (react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: Array.isArray(manageForm) ? manageForm : [manageForm], data: componentDefinition, onChangeData: onChangeDefinition, onChangeSchema: function (newSchema) {
            console.warn("ManageComponentForm.render", "TODO: Cannot alter schema inside ComponentRenderer in ManageComponentForm", { newSchema: newSchema });
        } }));
};
//# sourceMappingURL=ManageComponentForm.js.map