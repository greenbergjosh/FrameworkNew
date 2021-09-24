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
var wizard_manage_form_1 = require("./wizard-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var WizardInterfaceComponent = /** @class */ (function (_super) {
    __extends(WizardInterfaceComponent, _super);
    function WizardInterfaceComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { activeStep: 0 };
        return _this;
    }
    WizardInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "wizard",
            title: "Wizard",
            icon: "thunderbolt",
            componentDefinition: {
                component: "wizard",
                steps: [],
            },
        };
    };
    WizardInterfaceComponent.prototype.componentDidMount = function () {
        if (this.props.defaultActiveStep) {
            this.setState({ activeStep: this.props.defaultActiveStep });
        }
    };
    WizardInterfaceComponent.prototype.render = function () {
        var _this = this;
        var _a = this.props, onChangeData = _a.onChangeData, steps = _a.steps, userInterfaceData = _a.userInterfaceData;
        var activeStep = this.state.activeStep;
        var activeStepIndex = activeStep || 0;
        return (react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "steps" },
            react_1.default.createElement("div", null,
                react_1.default.createElement(antd_1.Steps, { current: activeStepIndex, onChange: function (stepIndex) { return _this.setState({ activeStep: stepIndex }); } }, steps.map(function (_a) {
                    var title = _a.title;
                    return (react_1.default.createElement(antd_1.Steps.Step, { key: title, title: title }));
                })),
                react_1.default.createElement("div", { className: "steps-content" },
                    react_1.default.createElement(DataPathContext_1.DataPathContext, { path: activeStepIndex + ".components" },
                        react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: steps.length ? steps[activeStepIndex].components : [], data: userInterfaceData, onChangeData: onChangeData, onChangeSchema: function (newSchema) {
                                if (_this.props.mode === "edit") {
                                    var _a = _this.props, onChangeSchema = _a.onChangeSchema, userInterfaceSchema = _a.userInterfaceSchema;
                                    console.warn("WizardInterfaceComponent.render", {
                                        newSchema: newSchema,
                                        activeStepIndex: activeStepIndex,
                                        onChangeSchema: _this.props.onChangeSchema,
                                        userInterfaceSchema: _this.props.userInterfaceSchema,
                                    });
                                    onChangeSchema &&
                                        userInterfaceSchema &&
                                        onChangeSchema(fp_1.set("steps." + activeStepIndex + ".components", newSchema, userInterfaceSchema));
                                }
                            } }))),
                react_1.default.createElement("div", { className: "steps-action" },
                    activeStepIndex < steps.length - 1 && (react_1.default.createElement(antd_1.Button, { type: "primary", onClick: function () { return _this.setState({ activeStep: activeStepIndex + 1 }); } }, "Next")),
                    activeStepIndex > 0 && (react_1.default.createElement(antd_1.Button, { style: { marginLeft: 8 }, onClick: function () { return _this.setState({ activeStep: activeStepIndex - 1 }); } }, "Previous"))))));
    };
    WizardInterfaceComponent.defaultProps = {
        steps: [],
    };
    WizardInterfaceComponent.manageForm = wizard_manage_form_1.wizardManageForm;
    return WizardInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.WizardInterfaceComponent = WizardInterfaceComponent;
//# sourceMappingURL=WizardInterfaceComponent.js.map