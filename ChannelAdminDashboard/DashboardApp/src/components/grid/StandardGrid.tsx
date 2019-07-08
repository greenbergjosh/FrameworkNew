import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { Dialog } from "@syncfusion/ej2-popups"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import React from "react"
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
} from "@syncfusion/ej2-react-grids"

const PureGridComponent = React.memo(GridComponent, shallowPropCheck(["columns", "data"]))

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
    dialog.header = args.requestType === "beginEdit" ? "Record of XYZ" : "New Row"
  }
}

export interface StandardGridComponentProps {
  allowAdding?: boolean
  allowDeleting?: boolean
  allowEditing?: boolean
  columns: ColumnModel[]
  data: JSONObject[]
  detailTemplate?: string | Function | any
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
    }: StandardGridComponentProps,
    ref?: React.Ref<GridComponent>
  ) => {
    console.log("StandardGrid.render", { data, detailTemplate })

    const handleToolbarClick = React.useMemo(
      () => (ref && typeof ref === "object" && handleToolbarItemClicked(ref)) || undefined,
      [ref]
    )

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
      <PureGridComponent
        ref={ref}
        {...commonGridOptions}
        toolbar={[...editingToolbarItems, ...commonGridOptions.toolbar]}
        actionComplete={actionComplete}
        columns={columns}
        dataSource={data}
        detailTemplate={detailTemplate}
        editOptions={editOptions}
        toolbarClick={handleToolbarClick}>
        <Inject services={gridComponentServices} />
      </PureGridComponent>
    )
  }
)
