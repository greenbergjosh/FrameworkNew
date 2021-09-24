"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = function (columns, data) {
    return columns.reduce(function (acc, column) {
        if (column.field) {
            data.forEach(function (row) {
                if (column.field) {
                    var rowValue = row[column.field];
                    if ((column.type === "number" && typeof rowValue === "number" && !isNaN(rowValue)) ||
                        (column.type === "string" && typeof rowValue === "string" && rowValue) ||
                        (column.type === "boolean" && typeof rowValue === "boolean") ||
                        (column.type === "date" && rowValue) ||
                        (column.type === "datetime" && rowValue)) {
                        if (!acc[column.field]) {
                            acc[column.field] = 0;
                        }
                        acc[column.field]++;
                    }
                }
            });
        }
        return acc;
    }, {});
};
exports.average = function (columns, data, counts) {
    var dataCounts = counts || exports.count(columns, data);
    return columns.reduce(function (acc, column) {
        if (column.field) {
            data.forEach(function (row) {
                if (column.field) {
                    var rowValue = row[column.field];
                    if (typeof rowValue === "number" && !isNaN(rowValue)) {
                        if (!acc[column.field]) {
                            acc[column.field] = 0;
                        }
                        acc[column.field] += rowValue / dataCounts[column.field];
                    }
                }
            });
        }
        return acc;
    }, {});
};
exports.flattenDataItems = function (data) {
    if (Array.isArray(data) || Array.isArray(data.items)) {
        return (Array.isArray(data) ? data : data.items).flatMap(exports.flattenDataItems);
    }
    else
        return data;
};
//# sourceMappingURL=grid-aggregate.js.map