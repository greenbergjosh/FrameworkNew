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
var sectioned_navigation_manage_form_1 = require("./sectioned-navigation-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var SectionedNavigationInterfaceComponent = /** @class */ (function (_super) {
    __extends(SectionedNavigationInterfaceComponent, _super);
    function SectionedNavigationInterfaceComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { activeKey: null };
        return _this;
    }
    SectionedNavigationInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "sectioned-navigation",
            title: "Sectioned Navigation",
            icon: "more",
            componentDefinition: {
                component: "sectioned-navigation",
                sections: [],
            },
        };
    };
    SectionedNavigationInterfaceComponent.prototype.componentDidMount = function () {
        if (this.props.defaultActiveKey) {
            this.setState({ activeKey: this.props.defaultActiveKey });
        }
    };
    SectionedNavigationInterfaceComponent.prototype.render = function () {
        var _this = this;
        var _a = this.props, onChangeData = _a.onChangeData, sections = _a.sections, title = _a.title, userInterfaceData = _a.userInterfaceData;
        var activeKey = this.state.activeKey;
        var activeSectionKey = activeKey || (sections[0] && sections[0].title);
        var menu = (react_1.default.createElement(antd_1.Menu, { style: { width: 256 }, selectedKeys: [activeSectionKey] }, sections.map(function (_a) {
            var title = _a.title;
            return (react_1.default.createElement(antd_1.Menu.Item, { key: title, title: title, onClick: function () { return _this.setState({ activeKey: title }); } }, title));
        })));
        return (react_1.default.createElement(antd_1.PageHeader, { title: react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(antd_1.Popover, { content: menu, trigger: "focus" },
                    react_1.default.createElement(antd_1.Button, { icon: "more" })),
                react_1.default.createElement("span", { style: { marginLeft: 15 } }, title)) },
            react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "sections" },
                react_1.default.createElement(react_1.default.Fragment, null, sections.map(function (_a, sectionIndex) {
                    var title = _a.title, components = _a.components;
                    return (react_1.default.createElement(antd_1.Card, { hidden: title !== activeSectionKey, title: title },
                        react_1.default.createElement(DataPathContext_1.DataPathContext, { path: sectionIndex + ".components" },
                            react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: components, data: userInterfaceData, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                                    if (_this.props.mode === "edit") {
                                        var _a = _this.props, onChangeSchema = _a.onChangeSchema, userInterfaceSchema = _a.userInterfaceSchema;
                                        console.warn("SectionedNavigationInterfaceComponent.render", {
                                            newSchema: newSchema,
                                            sectionIndex: sectionIndex,
                                            onChangeSchema: _this.props.onChangeSchema,
                                            userInterfaceSchema: _this.props.userInterfaceSchema,
                                        });
                                        onChangeSchema &&
                                            userInterfaceSchema &&
                                            onChangeSchema(fp_1.set("sections." + sectionIndex + ".components", newSchema, userInterfaceSchema));
                                    }
                                } }))));
                })))));
    };
    SectionedNavigationInterfaceComponent.defaultProps = {
        sections: [],
    };
    SectionedNavigationInterfaceComponent.manageForm = sectioned_navigation_manage_form_1.sectionedNavigationManageForm;
    return SectionedNavigationInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.SectionedNavigationInterfaceComponent = SectionedNavigationInterfaceComponent;
//# sourceMappingURL=SectionedNavigationInterfaceComponent.js.map