"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var Either_1 = require("fp-ts/lib/Either");
var json_logic_js_1 = __importDefault(require("json-logic-js"));
var fp_1 = require("lodash/fp");
var moment_1 = __importDefault(require("moment"));
var react_1 = __importDefault(require("react"));
var util_1 = require("../interface-builder/dnd/util");
var deep_diff_1 = require("../interface-builder/lib/deep-diff");
var eval_expression_1 = require("../interface-builder/lib/eval-expression");
var sanitize_text_1 = require("../interface-builder/lib/sanitize-text");
var grid_aggregate_1 = require("./grid-aggregate");
var ej2_react_grids_1 = require("@syncfusion/ej2-react-grids");
var PureGridComponent = react_1.default.memo(ej2_react_grids_1.GridComponent, function (prevProps, nextProps) {
    // Returns true if we should not re-render
    var simplePropEquality = util_1.shallowPropCheck(["columns", "dataSource"])(prevProps, nextProps);
    // Returns null if we should not re-render
    var runDeepDiff = function () {
        return deep_diff_1.deepDiff(prevProps, nextProps, function (k) {
            return ["children", "detailTemplate", "valueAccessor"].includes(k);
        });
    };
    var deepDiffResult = runDeepDiff();
    return simplePropEquality && !deepDiffResult;
});
var gridComponentServices = [
    ej2_react_grids_1.Toolbar,
    ej2_react_grids_1.ColumnChooser,
    ej2_react_grids_1.Resize,
    ej2_react_grids_1.DetailRow,
    ej2_react_grids_1.ExcelExport,
    ej2_react_grids_1.PdfExport,
    ej2_react_grids_1.Sort,
    ej2_react_grids_1.Filter,
    ej2_react_grids_1.Group,
    ej2_react_grids_1.Page,
    ej2_react_grids_1.Freeze,
    ej2_react_grids_1.Aggregate,
    ej2_react_grids_1.Edit,
];
// TODO: These should mostly be configurable
var commonGridOptions = {
    columnMenuItems: ["SortAscending", "SortDescending"],
    toolbar: [
        "CsvExport",
        "ExcelExport",
        "PdfExport",
        "Print",
        { text: "Group", tooltipText: "Group", prefixIcon: "e-group", id: "group" },
        {
            text: "Fit Columns",
            tooltipText: "Widen all columns to fit the contents of their widest cells",
            prefixIcon: "e-replace",
            id: "autofit",
        },
        {
            text: "Expand All",
            tooltipText: "Expand All Rows",
            prefixIcon: "e-expand",
            id: "expand",
        },
        {
            text: "Collapse All",
            tooltipText: "Collapse All Rows",
            prefixIcon: "e-collapse",
            id: "collapse",
        },
        "ColumnChooser",
    ],
    showColumnChooser: true,
    allowExcelExport: true,
    allowMultiSorting: true,
    allowPaging: true,
    allowPdfExport: true,
    allowResizing: true,
    allowReordering: true,
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    filterSettings: { type: "Menu" },
    groupSettings: { disablePageWiseAggregates: true },
    pageSettings: {
        pageSize: 50,
        pageSizes: ["All", 25, 50, 100, 150, 200, 500],
    },
    width: "100%",
    height: "100%",
};
var handleToolbarItemClicked = function (grid) { return function (args) {
    var id = args && args.item && args.item.id;
    if (id && grid.current) {
        if (id.endsWith("_excelexport")) {
            grid.current.excelExport();
        }
        else if (id.endsWith("_csvexport")) {
            grid.current.csvExport();
        }
        else if (id.endsWith("_pdfexport")) {
            grid.current.pdfExport();
        }
        else if (id === "autofit") {
            grid.current.autoFitColumns();
        }
        else if (id === "group") {
            grid.current.allowGrouping = !grid.current.allowGrouping;
        }
        else if (id === "expand") {
            if (grid.current.allowGrouping) {
                grid.current.groupModule.expandAll();
            }
            if (grid.current.detailRowModule) {
                grid.current.detailRowModule.expandAll();
            }
        }
        else if (id === "collapse") {
            if (grid.current.allowGrouping) {
                grid.current.groupModule.collapseAll();
            }
            if (grid.current.detailRowModule) {
                grid.current.detailRowModule.collapseAll();
            }
        }
    }
}; };
var actionComplete = function (arg) {
    if (arg && (arg.requestType === "beginEdit" || arg.requestType === "add")) {
        var dialog = arg.dialog;
        dialog.height = 400;
        // change the header of the dialog
        dialog.header = arg.requestType === "beginEdit" ? "Existing Record" : "New Row";
    }
};
exports.StandardGrid = react_1.default.forwardRef(function (_a, ref) {
    var allowAdding = _a.allowAdding, allowDeleting = _a.allowDeleting, allowEditing = _a.allowEditing, columns = _a.columns, contextData = _a.contextData, data = _a.data, detailTemplate = _a.detailTemplate, groupSettings = _a.groupSettings, loading = _a.loading, sortSettings = _a.sortSettings;
    var handleToolbarClick = react_1.default.useMemo(function () { return (ref && typeof ref === "object" && handleToolbarItemClicked(ref)) || undefined; }, [ref]);
    // Despite this being a bit odd in React, we only get one chance at creating the columns array with the SyncFusion Grid
    // We memoize it the first time, and then we can never regenerate columns or else we'll get tons of exceptions in the grid.
    var usableColumns = react_1.default.useMemo(function () {
        // const destructureFunction = (content: string) => `({${fields.join(", ")}}) => ${content}`
        return fp_1.cloneDeep(columns).map(function (column) {
            var col = column;
            // Intentionally mutating a clone
            // Default should be to NOT allow HTML rendering. That's a terrible practice.
            if (typeof col.disableHtmlEncode === "undefined" || col.disableHtmlEncode === null) {
                col.disableHtmlEncode = !col.allowHTMLText;
            }
            // Remove cell padding option
            if (col.removeCellPadding) {
                col.customAttributes = fp_1.merge({ class: "-remove-cell-padding" }, col.customAttributes || {});
            }
            // Managing custom formatting options for Dates
            if (["date", "dateTime"].includes(col.type || "")) {
                col.format =
                    col.skeletonFormat === "custom"
                        ? { type: col.type, format: col.customFormat }
                        : { type: col.type, skeleton: col.skeletonFormat || "short" };
                delete col.type;
            }
            // Managing custom formatting options for number types
            else if (["number"].includes(col.type || "")) {
                col.textAlign = "Right";
                col.headerTextAlign = "Left";
                col.format =
                    col.format === "standard"
                        ? "N" + (typeof col.precision === "number" ? col.precision : 2)
                        : col.format === "percentage"
                            ? "P" + (typeof col.precision === "number" ? col.precision : 2)
                            : col.format === "currency"
                                ? "C" + (typeof col.precision === "number" ? col.precision : 2)
                                : undefined;
            }
            // SyncFusion seems to read the customFormat, even though it's not documented
            delete col.customFormat;
            return col;
        });
    }, []);
    // Since we can only create the columns once, we unfortunately are left to manage (via mutations)
    // any changeable aspects of the columns
    react_1.default.useEffect(function () {
        usableColumns.forEach(function (col) {
            if (col.visibilityConditions && contextData) {
                col.visible = Either_1.tryCatch(function () {
                    return json_logic_js_1.default.apply(col.visibilityConditions, contextData);
                }).getOrElse(true);
            }
        });
        if (typeof ref === "object" && ref && ref.current && ref.current.headerModule) {
            ref.current.refresh();
        }
    }, [contextData]);
    // Detail template has to be manually assigned if it changed
    react_1.default.useEffect(function () {
        if (typeof ref === "object" && ref && ref.current && ref.current.headerModule) {
            ref.current.detailTemplate = detailTemplate;
        }
    }, [detailTemplate]);
    // Some data may have to be pre-processed in order not to cause the table to fail to render
    var usableData = react_1.default.useMemo(function () {
        return fp_1.cloneDeep(data).map(function (dataRow) {
            columns.forEach(function (_a) {
                var field = _a.field, type = _a.type;
                if (field) {
                    var value = dataRow[field];
                    if ((typeof value === "string" || typeof value === "number") &&
                        ["date", "dateTime"].includes(type || "")) {
                        // Date type columns must appear as JS Date objects, not strings
                        dataRow[field] = moment_1.default(value).toDate();
                    }
                    else if (field[0] === "=") {
                        var calculationString_1 = field.substring(1);
                        var evald = Either_1.tryCatch(function () {
                            var interpolatedCalculationString = fp_1.sortBy(function (_a) {
                                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                                return key && key.length;
                            }, Object.entries(dataRow)).reduce(function (acc, _a) {
                                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                                return acc.replace(key, String(value));
                            }, calculationString_1);
                            return eval_expression_1.evalExpression(interpolatedCalculationString);
                        }).fold(function (error) {
                            return (console.warn("StandardGrid.render", "usableData", field, error), 0) || null;
                        }, function (value) { return (isNaN(value) || !isFinite(value) ? null : value); });
                        dataRow[field] = evald;
                    }
                }
            });
            return dataRow;
        });
    }, [data]);
    var _b = __read(react_1.default.useMemo(function () {
        var counts = grid_aggregate_1.count(usableColumns, usableData);
        var averages = grid_aggregate_1.average(usableColumns, usableData, counts);
        return [averages, counts];
    }, [usableColumns, usableData]), 2), columnAverages = _b[0], columnCounts = _b[1];
    var customAverageAggregate = react_1.default.useCallback(function (data, column) {
        return (!data.requestType && (data.items || Array.isArray(data))
            ? grid_aggregate_1.average(usableColumns.filter(function (_a) {
                var field = _a.field;
                return field === column.field;
            }), grid_aggregate_1.flattenDataItems(data))
            : columnAverages)[column.field || column.columnName || ""];
    }, [columnAverages]);
    var customValueCountAggregate = react_1.default.useCallback(function (data, column) {
        return (!data.requestType && data.items
            ? grid_aggregate_1.count(usableColumns.filter(function (_a) {
                var field = _a.field;
                return field === column.field;
            }), grid_aggregate_1.flattenDataItems(data))
            : columnCounts)[column.field || column.columnName || ""];
    }, [columnCounts]);
    var customNullCountAggregate = react_1.default.useCallback(function (data, column) {
        return data.count -
            (!data.requestType && data.items
                ? grid_aggregate_1.count(usableColumns.filter(function (_a) {
                    var field = _a.field;
                    return field === column.field;
                }), grid_aggregate_1.flattenDataItems(data))
                : columnCounts)[column.field || column.columnName || ""];
    }, [columnCounts]);
    var customAggregateFunctions = react_1.default.useMemo(function () { return ({
        CustomIgnoreBlankAverage: customAverageAggregate,
        CustomValueCount: customValueCountAggregate,
        CustomNullCount: customNullCountAggregate,
    }); }, [columnAverages, columnCounts]);
    react_1.default.useEffect(function () {
        if (ref && typeof ref === "object" && ref.current) {
            ref.current.aggregates.forEach(function (_a) {
                var columns = _a.columns;
                console.log("StandardGrid", "Update Custom Aggregate", columns);
                columns &&
                    columns.forEach(function (column) {
                        var usableColumn = usableColumns.find(function (_a) {
                            var field = _a.field;
                            return field === column.field;
                        });
                        if (usableColumn && usableColumn.aggregationFunction) {
                            column.customAggregate = customAggregateFunctions[usableColumn.aggregationFunction];
                        }
                    });
            });
        }
    }, [columnAverages, usableColumns]);
    var aggregates = react_1.default.useMemo(function () {
        return [
            {
                columns: usableColumns.reduce(function (acc, col) {
                    var column = col;
                    var aggregationFunction = column.aggregationFunction;
                    if (aggregationFunction) {
                        var isCustom = aggregationFunction.startsWith("Custom");
                        var format = [
                            "Count",
                            "TrueCount",
                            "FalseCount",
                            "CustomValueCount",
                            "CustomNullCount",
                        ].includes(aggregationFunction)
                            ? "N0"
                            : column.format;
                        var template = "<span title='" + sanitize_text_1.sanitizeText(aggregationFunction) + "'>${" + (isCustom ? "Custom" : aggregationFunction) + "}</span>";
                        acc.push({
                            field: column.field,
                            type: [isCustom ? "Custom" : aggregationFunction],
                            format: format,
                            customAggregate: customAggregateFunctions[aggregationFunction],
                            footerTemplate: template,
                            groupCaptionTemplate: template,
                        });
                    }
                    return acc;
                }, []),
            },
        ];
    }, [usableColumns]);
    var dataBound = react_1.default.useCallback(function () {
        ref && typeof ref === "object" && ref.current && ref.current.autoFitColumns();
    }, [ref, usableData]);
    var editSettings = { allowAdding: allowAdding, allowDeleting: allowDeleting, allowEditing: allowEditing, mode: "Dialog" };
    var editingToolbarItems = [].concat(allowAdding ? "Add" : [], allowEditing ? "Edit" : [], allowDeleting ? "Delete" : []);
    return (react_1.default.createElement(antd_1.Spin, { spinning: loading },
        react_1.default.createElement(PureGridComponent, __assign({ ref: ref }, commonGridOptions, { allowGrouping: groupSettings && groupSettings.columns ? groupSettings.columns.length > 0 : false, toolbar: __spread(editingToolbarItems, commonGridOptions.toolbar), actionComplete: actionComplete, aggregates: aggregates, columns: usableColumns, 
            // dataBound={dataBound}
            dataSource: usableData, detailTemplate: detailTemplate, editSettings: editSettings, groupSettings: __assign(__assign({}, commonGridOptions.groupSettings), groupSettings), sortSettings: sortSettings, toolbarClick: handleToolbarClick }),
            react_1.default.createElement(ej2_react_grids_1.Inject, { services: gridComponentServices }))));
});
//# sourceMappingURL=StandardGrid.js.map