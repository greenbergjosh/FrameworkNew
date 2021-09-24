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
var DataPathContext_1 = require("../../../util/DataPathContext");
var ComponentRenderer_1 = require("../../../ComponentRenderer");
var collapse_manage_form_1 = require("./collapse-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var CollapseInterfaceComponent = /** @class */ (function (_super) {
    __extends(CollapseInterfaceComponent, _super);
    function CollapseInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CollapseInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "collapse",
            title: "Collapse",
            icon: "vertical-align-middle",
            componentDefinition: {
                component: "collapse",
                sections: [],
            },
        };
    };
    CollapseInterfaceComponent.prototype.render = function () {
        var _this = this;
        var _a = this.props, accordion = _a.accordion, onChangeData = _a.onChangeData, sections = _a.sections, userInterfaceData = _a.userInterfaceData;
        return (react_1.default.createElement(antd_1.Collapse, { accordion: accordion }, sections.map(function (section, sectionIndex) { return (react_1.default.createElement(antd_1.Collapse.Panel, { key: section.title, header: section.title },
            react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "sections." + sectionIndex + ".components" },
                react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: section.components, data: userInterfaceData, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                        if (_this.props.mode === "edit") {
                            var _a = _this.props, onChangeSchema = _a.onChangeSchema, userInterfaceSchema = _a.userInterfaceSchema;
                            console.warn("CollapseInterfaceComponent.render", {
                                newSchema: newSchema,
                                sectionIndex: sectionIndex,
                                onChangeSchema: _this.props.onChangeSchema,
                                userInterfaceSchema: _this.props.userInterfaceSchema,
                            });
                            onChangeSchema &&
                                userInterfaceSchema &&
                                onChangeSchema(fp_1.set("sections." + sectionIndex + ".components", newSchema, userInterfaceSchema));
                        }
                    } })))); })));
    };
    CollapseInterfaceComponent.manageForm = collapse_manage_form_1.collapseManageForm;
    return CollapseInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.CollapseInterfaceComponent = CollapseInterfaceComponent;
//# sourceMappingURL=CollapseInterfaceComponent.js.map