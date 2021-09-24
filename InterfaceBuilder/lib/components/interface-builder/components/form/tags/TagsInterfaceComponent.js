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
Object.defineProperty(exports, "__esModule", { value: true });
var SelectInterfaceComponent_1 = require("../select/SelectInterfaceComponent");
var tags_manage_form_1 = require("./tags-manage-form");
var TagsInterfaceComponent = /** @class */ (function (_super) {
    __extends(TagsInterfaceComponent, _super);
    function TagsInterfaceComponent(props) {
        return _super.call(this, props) || this;
    }
    TagsInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Form",
            name: "tags",
            title: "Tags",
            icon: "tags",
            formControl: true,
            componentDefinition: {
                component: "tags",
                label: "Tags",
            },
        };
    };
    Object.defineProperty(TagsInterfaceComponent.prototype, "mode", {
        get: function () {
            return SelectInterfaceComponent_1.MODES.tags;
        },
        enumerable: true,
        configurable: true
    });
    TagsInterfaceComponent.defaultProps = {
        allowClear: true,
        createNewLabel: "Create New...",
        defaultValue: undefined,
        multiple: false,
        placeholder: "Choose",
        valueKey: "value",
        valuePrefix: "",
        valueSuffix: "",
    };
    TagsInterfaceComponent.manageForm = tags_manage_form_1.tagsManageForm;
    return TagsInterfaceComponent;
}(SelectInterfaceComponent_1.SelectInterfaceComponent));
exports.TagsInterfaceComponent = TagsInterfaceComponent;
//# sourceMappingURL=TagsInterfaceComponent.js.map