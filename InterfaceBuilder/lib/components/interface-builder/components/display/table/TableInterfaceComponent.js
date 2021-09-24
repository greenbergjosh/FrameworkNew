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
var fp_1 = require("lodash/fp");
var react_1 = __importDefault(require("react"));
var StandardGrid_1 = require("../../../../grid/StandardGrid");
var ComponentRenderer_1 = require("../../../ComponentRenderer");
var DataPathContext_1 = require("../../../util/DataPathContext");
var table_column_form_section_advanced_1 = require("./table-column-form-section-advanced");
var table_column_form_section_aggregate_1 = require("./table-column-form-section-aggregate");
var table_column_form_section_group_1 = require("./table-column-form-section-group");
var table_column_form_section_sort_1 = require("./table-column-form-section-sort");
var table_data_types_form_1 = require("./table-data-types-form");
var table_manage_form_1 = require("./table-manage-form");
var BaseInterfaceComponent_1 = require("../../base/BaseInterfaceComponent");
var TableInterfaceComponent = /** @class */ (function (_super) {
    __extends(TableInterfaceComponent, _super);
    function TableInterfaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TableInterfaceComponent.getLayoutDefinition = function () {
        return {
            category: "Display",
            name: "table",
            title: "Table",
            icon: "table",
            componentDefinition: {
                component: "table",
                columns: [],
                rowDetails: [],
            },
        };
    };
    TableInterfaceComponent.prototype.render = function () {
        var _this = this;
        var _a = this.props, abstract = _a.abstract, allowAdding = _a.allowAdding, allowDeleting = _a.allowDeleting, allowEditing = _a.allowEditing, columns = _a.columns, _b = _a.loadingKey, loadingKey = _b === void 0 ? "loading" : _b, onChangeData = _a.onChangeData, rowDetails = _a.rowDetails, userInterfaceData = _a.userInterfaceData, valueKey = _a.valueKey;
        return (react_1.default.createElement(ComponentRenderer_1.ComponentRendererModeContext.Consumer, null, function (mode) {
            console.log("TableInterfaceComponent.render", { props: _this.props, mode: mode });
            var dataArray = fp_1.get(valueKey, userInterfaceData) || [];
            var data = { columns: dataArray };
            if (abstract) {
                return (react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: editComponents, data: data, dragDropDisabled: true, onChangeData: function (newData) {
                        // console.log("TableInterfaceComponent.render", "onChangeData", { data, newData })
                        onChangeData && onChangeData(fp_1.set(valueKey, newData.columns, userInterfaceData));
                    }, onChangeSchema: function (newData) {
                        console.log("TableInterfaceComponent.render", "onChangeSchema X3", {
                            abstract: abstract,
                            mode: mode,
                            data: data,
                            newData: newData,
                        });
                        // onChangeSchema &&
                        //   userInterfaceSchema &&
                        //   onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
                    } }));
            }
            else {
                switch (_this.props.mode) {
                    case "edit": {
                        var _a = _this.props, onChangeSchema_1 = _a.onChangeSchema, userInterfaceSchema_1 = _a.userInterfaceSchema;
                        return (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: editComponents, data: userInterfaceSchema_1, mode: "display", onChangeData: function (newData) {
                                    // console.log("TableInterfaceComponent.render", "onChangeData", {
                                    //   abstract,
                                    //   mode,
                                    //   data,
                                    //   newData,
                                    //   onChangeSchema,
                                    //   userInterfaceSchema,
                                    // })
                                    onChangeSchema_1 &&
                                        userInterfaceSchema_1 &&
                                        onChangeSchema_1(fp_1.set("columns", newData.columns, userInterfaceSchema_1));
                                }, onChangeSchema: function (newData) {
                                    console.log("TableInterfaceComponent.render", "onChangeSchema X1", {
                                        abstract: abstract,
                                        mode: mode,
                                        data: data,
                                        newData: newData,
                                        onChangeSchema: onChangeSchema_1,
                                        userInterfaceSchema: userInterfaceSchema_1,
                                    });
                                    // onChangeSchema &&
                                    //   userInterfaceSchema &&
                                    //   onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
                                } }),
                            react_1.default.createElement(antd_1.Typography.Title, { level: 4 }, "Row Details"),
                            react_1.default.createElement("div", { style: { marginLeft: 15 } },
                                react_1.default.createElement(DataPathContext_1.DataPathContext, { path: "rowDetails" },
                                    react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: rowDetails, data: data, onChangeData: function (newData) {
                                            return onChangeData && onChangeData(fp_1.set(valueKey, newData, userInterfaceData));
                                        }, onChangeSchema: function (newSchema) {
                                            // console.log("TableInterfaceComponent.render", "onChangeSchema X2", {
                                            //   abstract,
                                            //   mode,
                                            //   data,
                                            //   newSchema,
                                            //   onChangeSchema,
                                            //   userInterfaceSchema,
                                            // })
                                            onChangeSchema_1 &&
                                                userInterfaceSchema_1 &&
                                                onChangeSchema_1(fp_1.set("rowDetails", newSchema, userInterfaceSchema_1));
                                        } })))));
                    }
                    case "display": {
                        var dataArray_1 = fp_1.get(valueKey, userInterfaceData) || [userInterfaceData];
                        var sortSettings = {
                            columns: fp_1.sortBy("sortOrder", columns).reduce(function (acc, column) {
                                if (column.sortDirection && column.field) {
                                    acc.push({ field: column.field, direction: column.sortDirection });
                                }
                                return acc;
                            }, []),
                        };
                        var groupSettings = {
                            columns: fp_1.sortBy("groupOrder", columns).reduce(function (acc, column) {
                                if (column.field && typeof column.groupOrder !== "undefined") {
                                    acc.push(column.field);
                                }
                                return acc;
                            }, []),
                        };
                        var loading = loadingKey && fp_1.get(loadingKey, userInterfaceData);
                        // console.log("TableInterfaceComponent.render", "Display", this.props, {
                        //   dataArray,
                        //   rowDetails,
                        // })
                        return (react_1.default.createElement(StandardGrid_1.StandardGrid, { allowAdding: allowAdding, allowDeleting: allowAdding, allowEditing: allowEditing, columns: columns, contextData: userInterfaceData, data: dataArray_1, loading: !!loading, sortSettings: sortSettings, groupSettings: groupSettings, detailTemplate: rowDetails && rowDetails.length
                                ? function (parentData) {
                                    // console.log("TableInterfaceComponent.render", "Display Child", {
                                    //   rowDetails,
                                    //   parentData,
                                    // })
                                    return (react_1.default.createElement(ComponentRenderer_1.ComponentRenderer, { components: rowDetails, data: parentData, onChangeData: function (newData) {
                                            return onChangeData &&
                                                onChangeData(fp_1.set(valueKey, newData, userInterfaceData));
                                        }, onChangeSchema: function (newSchema) {
                                            console.log("TableInterfaceComponent.render", "onChangeSchema X4", {
                                                abstract: abstract,
                                                mode: mode,
                                                data: data,
                                                newSchema: newSchema,
                                            });
                                            // onChangeSchema &&
                                            //   userInterfaceSchema &&
                                            //   onChangeSchema(
                                            //     set("rowDetails", newSchema, userInterfaceSchema)
                                            //   )
                                        } }));
                                }
                                : undefined }));
                    }
                }
            }
        }));
    };
    TableInterfaceComponent.manageForm = table_manage_form_1.tableManageForm;
    return TableInterfaceComponent;
}(BaseInterfaceComponent_1.BaseInterfaceComponent));
exports.TableInterfaceComponent = TableInterfaceComponent;
var editComponents = [
    {
        key: "columns",
        valueKey: "columns",
        label: "Columns",
        addItemLabel: "Add Column",
        component: "list",
        emptyText: "No Configured Columns",
        orientation: "horizontal",
        preconfigured: true,
        components: [
            {
                key: "column",
                component: "card",
                preconfigured: true,
                size: "small",
                components: __spread([
                    {
                        key: "header",
                        valueKey: "headerText",
                        label: "Header",
                        component: "input",
                    },
                    {
                        key: "field",
                        valueKey: "field",
                        label: "Field",
                        component: "input",
                    },
                    {
                        key: "type",
                        valueKey: "type",
                        label: "Type",
                        component: "select",
                        dataHandlerType: "local",
                        data: {
                            values: table_data_types_form_1.tableDataTypes.map(function (type) { return type.option; }),
                        },
                        defaultValue: "string",
                    }
                ], table_data_types_form_1.tableDataTypes.flatMap(function (type) {
                    return type.form.map(function (formItem) { return (__assign(__assign({}, formItem), { visibilityConditions: formItem.visibilityConditions
                            ? {
                                and: [formItem.visibilityConditions, visiblityConditionType(type.option.value)],
                            }
                            : visiblityConditionType(type.option.value) })); });
                }), [
                    {
                        hideLabel: true,
                        label: "",
                        key: "details",
                        valueKey: "",
                        component: "collapse",
                        sections: [table_column_form_section_sort_1.tableSortForm, table_column_form_section_group_1.tableGroupForm, table_column_form_section_aggregate_1.tableAggregateForm, table_column_form_section_advanced_1.tableAdvancedForm],
                    },
                ]),
            },
        ],
    },
];
function visiblityConditionType(type) {
    return {
        "===": [
            type,
            {
                var: ["type"],
            },
        ],
    };
}
//# sourceMappingURL=TableInterfaceComponent.js.map