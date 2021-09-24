"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableAggregateForm = {
    title: "Aggregate",
    components: [
        {
            key: "aggregationFunction",
            valueKey: "aggregationFunction",
            label: "Method",
            help: "How to aggregate this column",
            component: "select",
            dataHandlerType: "local",
            data: {
                values: [
                    {
                        label: "Sum",
                        value: "Sum",
                    },
                    {
                        label: "Average",
                        value: "Average",
                    },
                    {
                        label: "Average (Ignore Blanks)",
                        value: "CustomIgnoreBlankAverage",
                    },
                    {
                        label: "Minimum",
                        value: "Min",
                    },
                    {
                        label: "Maximum",
                        value: "Max",
                    },
                    {
                        label: "Count",
                        value: "Count",
                    },
                    {
                        label: "Count (True)",
                        value: "Truecount",
                    },
                    {
                        label: "Count (False)",
                        value: "Falsecount",
                    },
                    {
                        label: "Count (Has Value)",
                        value: "CustomValueCount",
                    },
                    {
                        label: "Count (Has No Value)",
                        value: "CustomNullCount",
                    },
                ],
            },
        },
    ],
};
//# sourceMappingURL=table-column-form-section-aggregate.js.map