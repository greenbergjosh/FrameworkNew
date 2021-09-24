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
var react_1 = __importDefault(require("react"));
var DataPathContext_1 = require("../../../util/DataPathContext");
var ComponentRenderer_1 = require("../../../ComponentRenderer");
var tabs_manage_form_1 = require("./tabs-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var TabsInterfaceComponent = /** @class */ (function (_super) {
    __extends(TabsInterfaceComponent, _super);
    function TabsInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabsInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "tabs",
            title: "Tabs",
            icon: "folder",
            componentDefinition: {
                component: "tabs",
            },
        };
    };
    TabsInterfaceComponent.prototype.render = function () {
        var _a = this.props, defaultActiveKey = _a.defaultActiveKey, onChangeData = _a.onChangeData, tabs = _a.tabs, userInterfaceData = _a.userInterfaceData;
        return (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "tabs" },
            react_1.default.createElement(antd_1.Tabs, { defaultActiveKey: "tab0" }, tabs &&
                tabs.map(function (tab, index) { return (react_1.default.createElement(antd_1.Tabs.TabPane, { tab: tab.label, key: "tab" + index },
                    react_1.default.createElement(DataPathContext_1.DataPathContext, { path: index + ".components" },
                        react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: tab.components ||
                                [], data: userInterfaceData, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                                console.warn("TabsInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in Tabs", { newSchema: newSchema });
                            } })))); }))));
    };
    TabsInterfaceComponent.manageForm = tabs_manage_form_1.tabsManageForm;
    return TabsInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.TabsInterfaceComponent = TabsInterfaceComponent;
//# sourceMappingURL=TabsInterfaceComponent.js.map