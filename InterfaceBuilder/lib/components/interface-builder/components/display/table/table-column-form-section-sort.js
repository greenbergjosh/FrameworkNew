"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableSortForm = {
    title: "Sort",
    components: [
        {
            key: "allowSorting",
            valueKey: "allowSorting",
            label: "Allow Sorting",
            component: "toggle",
            defaultValue: true,
        },
        {
            key: "sortDirection",
            valueKey: "sortDirection",
            label: "Direction",
            component: "select",
            dataHandlerType: "local",
            data: {
                values: [
                    {
                        label: "Ascending",
                        value: "Ascending",
                    },
                    {
                        label: "Descending",
                        value: "Descending",
                    },
                ],
            },
        },
        {
            key: "sortOrder",
            valueKey: "sortOrder",
            label: "Order",
            help: "The lowest Order is the first column sorted, followed by the next lowest, and so on",
            component: "number-input",
        },
    ],
};
//# sourceMappingURL=table-column-form-section-sort.js.map