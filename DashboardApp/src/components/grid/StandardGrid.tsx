import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { Dialog } from "@syncfusion/ej2-popups"
import { Spin } from "antd"
import { cloneDeep } from "lodash/fp"
import React from "react"
import { JSONRecord } from "../../data/JSON"
import { deepDiff } from "../../lib/deep-diff"
import { shallowPropCheck } from "../interface-builder/dnd/util/shallow-prop-check"
import {
  Aggregate,
  ColumnChooser,
  ColumnMenuItem,
  ColumnModel,
  DetailRow,
  Edit,
  ExcelExport,
  Filter,
  FilterSettingsModel,
  Freeze,
  GridComponent,
  Inject,
  PdfExport,
  Resize,
  Sort,
  Toolbar,
  DialogEditEventArgs,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"

const PureGridComponent = React.memo(GridComponent, (prevProps, nextProps) => {
  // @ts-ignore
  const simplePropEquality = shallowPropCheck(["columns", "data"])(prevProps, nextProps)
  const runDeepDiff = () =>
    deepDiff(prevProps, nextProps, (k) =>
      ["children", "detailTemplate", "valueAccessor"].includes(k)
    )
  // console.log("PureGridComponent.memo", simplePropEquality, runDeepDiff(), { prevProps, nextProps })

  return simplePropEquality && !runDeepDiff()
})

const gridComponentServices = [
  Toolbar,
  ColumnChooser,
  Resize,
  DetailRow,
  ExcelExport,
  PdfExport,
  Sort,
  Filter,
  Freeze,
  Aggregate,
  Edit,
]

const commonGridOptions = {
  columnMenuItems: ["SortAscending", "SortDescending"] as ColumnMenuItem[],
  toolbar: ["CsvExport", "ExcelExport", "PdfExport", "Print", "ColumnChooser"],
  showColumnChooser: true,
  allowExcelExport: true,
  allowMultiSorting: true,
  allowPdfExport: true,
  allowResizing: true,
  allowReordering: true,
  allowSorting: true,
  allowFiltering: true,
  filterSettings: { type: "Menu" } as FilterSettingsModel,
}

const handleToolbarItemClicked = (grid: React.RefObject<GridComponent>) => (
  args?: ClickEventArgs
) => {
  const id = args && args.item && args.item.id
  if (id && grid.current) {
    if (id.endsWith("_excelexport")) {
      grid.current.excelExport()
    } else if (id.endsWith("_csvexport")) {
      grid.current.csvExport()
    } else if (id.endsWith("_pdfexport")) {
      grid.current.pdfExport()
    }
  }
}

const actionComplete = (args: DialogEditEventArgs): void => {
  if (args.requestType === "beginEdit" || args.requestType === "add") {
    const dialog: Dialog = args.dialog as Dialog
    dialog.height = 400
    // change the header of the dialog
    dialog.header = args.requestType === "beginEdit" ? "Existing Record" : "New Row"
  }
}

export interface StandardGridComponentProps {
  allowAdding?: boolean
  allowDeleting?: boolean
  allowEditing?: boolean
  columns: ColumnModel[]
  data: JSONRecord[]
  detailTemplate?: string | Function | any
  loading?: boolean
  sortSettings?: SortSettingsModel
  //   editSettingsTemplate?: string | Function | any
  //   groupSettingsCaptionTemplate?: string | Function | any
  //   onToolbarClick: (args?: ClickEventArgs) => void
  //   pagerTemplate?: string | Function | any
  //   rowTemplate?: string | Function | any
  //   toolbarTemplate?: string | Function | any
}

export const StandardGrid = React.forwardRef(
  (
    {
      allowAdding,
      allowDeleting,
      allowEditing,
      columns,
      data,
      detailTemplate,
      loading,
      sortSettings,
    }: StandardGridComponentProps,
    ref?: React.Ref<GridComponent>
  ) => {
    console.log("StandardGrid.render", { data, detailTemplate })

    const handleToolbarClick = React.useMemo(
      () => (ref && typeof ref === "object" && handleToolbarItemClicked(ref)) || undefined,
      [ref]
    )

    const usableColumns = React.useMemo(() => cloneDeep(columns), [])

    // const createDetailTemplate = React.useMemo(() => {
    //   console.log("StandardGrid.render", "detailTemplate 2", detailTemplate)
    //   return typeof detailTemplate === "function" ? detailTemplate() : detailTemplate
    // }, [detailTemplate])

    const editOptions = { allowAdding, allowDeleting, allowEditing, mode: "Dialog" }
    const editingToolbarItems = ([] as string[]).concat(
      allowAdding ? "Add" : [],
      allowEditing ? "Edit" : [],
      allowDeleting ? "Delete" : []
    )

    return (
      <Spin spinning={loading}>
        <PureGridComponent
          ref={ref}
          {...commonGridOptions}
          toolbar={[...editingToolbarItems, ...commonGridOptions.toolbar]}
          actionComplete={actionComplete}
          columns={usableColumns}
          dataSource={data}
          detailTemplate={detailTemplate}
          editOptions={editOptions}
          sortSettings={sortSettings}
          toolbarClick={handleToolbarClick}>
          <Inject services={gridComponentServices} />
        </PureGridComponent>
      </Spin>
    )
  }
)
