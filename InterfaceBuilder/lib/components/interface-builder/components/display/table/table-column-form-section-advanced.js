"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableAdvancedForm = {
    title: "Advanced",
    components: [
        {
            key: "allowHTMLText",
            valueKey: "allowHTMLText",
            label: "Allow HTML Text",
            help: "If true, text containing HTML markup will be rendered as HTML rather than as raw text",
            component: "toggle",
            defaultValue: false,
        },
        {
            key: "removeCellPadding",
            valueKey: "removeCellPadding",
            label: "Remove Cell Padding",
            help: "Removes the default spacing around cell contents to make more readable",
            component: "toggle",
            defaultValue: false,
        },
    ],
};
//# sourceMappingURL=table-column-form-section-advanced.js.map