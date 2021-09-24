"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableGroupForm = {
    title: "Group",
    components: [
        {
            key: "allowGrouping",
            valueKey: "allowGrouping",
            label: "Allow Grouping",
            help: "If turned off, users will not be able to add, remove, or change the grouping, but it can still be pre-configured below.",
            component: "toggle",
            defaultValue: true,
        },
        {
            key: "groupOrder",
            valueKey: "groupOrder",
            label: "Order",
            help: "The lowest Order is the first column grouped, followed by the next lowest, and so on",
            component: "number-input",
        },
    ],
};
//# sourceMappingURL=table-column-form-section-group.js.map