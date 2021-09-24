import React from "react"
import { Col, PageHeader, Row, Typography } from "antd"
import { BaseInterfaceComponent, UserInterfaceContext } from "@opg/interface-builder"
import { StandardGridTypes } from "@opg/interface-builder-plugins/lib/syncfusion/table"
import * as iots from "io-ts"
import { reporter } from "io-ts-reporters"
import * as record from "fp-ts/lib/Record"
import { sortBy } from "lodash/fp"
import { Helmet } from "react-helmet"
import { FilteredMenu } from "../../../../../../components/FilteredMenu"
import { Query } from "../../../../../../components/query/Query"
import { QueryProps } from "../../../../../../components/query/types"
import { useRematch } from "../../../../../../hooks"
import { PartnerStatus } from "../../../../../../state/import-ingestion-report"
import { store } from "../../../../../../state/store"
import { createUIContext } from "../../../../../../data/AdminUserInterfaceContextManager"
import { EXPORT_STATUS_QUERY_CONFIG_ID, INGESTION_STATUS_QUERY_CONFIG_ID, PARTNER_QUERY_CONFIG_ID } from "./constants"
import ImportIngestionTable from "./ImportIngestionTable"
import ExportTable from "./ExportTable"
import "./import-ingestion.scss"
import { WithRouteProps } from "../../../../../../state/navigation"
import { PageBeacon } from "../../../../../../components/PageBeacon"

/* *************************
 * INTERFACES
 */

interface Props {
  selectedPartner: string
}

export type IngestionStatus = iots.TypeOf<typeof IngestionStatusCodec>
export const IngestionStatusCodec = iots.type({
  last_id_processed: iots.number,
  rows_processed: iots.number,
  runtime: iots.number,
  succeeded: iots.boolean,
  table_name: iots.string,
})

export type ExportStatus = iots.TypeOf<typeof ExportStatusCodec>
export const ExportStatusCodec = iots.type({
  partner: iots.string,
  rowcount: iots.number,
  export_date: iots.string,
  export_name: iots.string,
})

/* *************************
 * COMPONENTS
 */

export function ImportIngestionReportView(props: WithRouteProps<Props>): JSX.Element {
  console.log("ImportIngestionReportView.render")

  const [fromStore, dispatch] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    configs: appState.globalConfig.configs,
    selectedPartner: appState.importIngestionReport.selectedPartner,
    reportDataByQuery: appState.reports.reportDataByQuery,
  }))

  // React.useEffect invoke 4 data calls
  // setTimeout return a cleanup fn for unmount, call and reset the interval
  // increment counter (React.useState) | or lastRequestedTS

  const partnerQueryConfig = record.lookup(PARTNER_QUERY_CONFIG_ID, fromStore.configsById).toUndefined()
  const partnerQueryId = partnerQueryConfig && partnerQueryConfig.id

  const ingestionStatusQueryConfig = record
    .lookup(INGESTION_STATUS_QUERY_CONFIG_ID, fromStore.configsById)
    .toUndefined()
  const ingestionStatusQueryConfigId = ingestionStatusQueryConfig && ingestionStatusQueryConfig.id

  const exportStatusQueryConfig = record.lookup(EXPORT_STATUS_QUERY_CONFIG_ID, fromStore.configsById).toUndefined()
  const exportStatusQueryConfigId = exportStatusQueryConfig && exportStatusQueryConfig.id

  const contextManager = React.useMemo(
    () => createUIContext(dispatch, fromStore.reportDataByQuery, fromStore.configs, fromStore.configsById),
    [dispatch, fromStore.reportDataByQuery, fromStore.configs, fromStore.configsById]
  )

  console.log("index.render", "Selected", fromStore.selectedPartner)
  const selectedPartnerTables = React.useMemo(
    () =>
      fromStore.selectedPartner && fromStore.selectedPartner.Tables
        ? Object.keys(fromStore.selectedPartner.Tables)
        : [],
    [fromStore.selectedPartner]
  )

  const partnerMenu = React.useCallback<QueryProps<PartnerStatus>["children"]>(
    ({ data }) => (
      <>
        <FilteredMenu
          data={data}
          labelAccessor="name"
          valueAccessor="id"
          onSelect={(selected) => {
            console.log("selected:", selected, "selectedPartner:", fromStore.selectedPartner)
            const toggledSelection = selected === fromStore.selectedPartner ? null : selected
            dispatch.importIngestionReport.updateSelectedPartner(selected ? toggledSelection : null)
          }}
          selected={fromStore.selectedPartner}
          inputClassName={"partner-filter"}
        />
      </>
    ),
    [
      fromStore.selectedPartner && fromStore.selectedPartner.id,
      dispatch.importIngestionReport,
      fromStore.selectedPartner,
    ]
  )

  function sortByPartner<T>(data: T[], comparator: (item: T) => boolean): T[] {
    if (!fromStore.selectedPartner) {
      return data
    }
    // We're using sortBy to move the items of the selected table to the front
    // without re-arranging anything else
    const sorted = sortBy((item) => (comparator(item) ? 1 : 2), data)
    return sorted as T[]
  }

  const isSelectedPartnerImportIngestion = (selectedPartnerTables: string[]) => (item: IngestionStatus) =>
    selectedPartnerTables.includes(item.table_name)

  const isSelectedPartnerExport = (selectedPartner: PartnerStatus | null) => (item: ExportStatus) =>
    !!selectedPartner && selectedPartner.name.toLowerCase() === item.partner.toLowerCase()

  function importIngestionRowDataBound(rowDataBoundEventArgs?: StandardGridTypes.RowDataBoundEventArgs): void {
    if (!rowDataBoundEventArgs) {
      return
    }
    // This is an Either<Errors, IngestionStatus>
    const ingestionStatusDecoded = IngestionStatusCodec.decode(rowDataBoundEventArgs.data)
    ingestionStatusDecoded.fold(
      () => {
        console.warn("IngestionStatusReport.rowDataBound", "Failed to parse row data", {
          data: rowDataBoundEventArgs.data,
          message: reporter(ingestionStatusDecoded),
        })
        return null
      },
      (ingestionStatus) => {
        const data = rowDataBoundEventArgs.data as IngestionStatus
        if (!rowDataBoundEventArgs.row) {
          return
        }
        if (!data.succeeded) rowDataBoundEventArgs.row.classList.add("error-row")
        else if (isSelectedPartnerImportIngestion(selectedPartnerTables)(data))
          rowDataBoundEventArgs.row.classList.add("highlight-row")
      }
    )
  }

  function exportRowDataBound(rowDataBoundEventArgs?: StandardGridTypes.RowDataBoundEventArgs): void {
    if (!rowDataBoundEventArgs) {
      return
    }
    // This is an Either<Errors, IngestionStatus>
    const exportStatusDecoded = ExportStatusCodec.decode(rowDataBoundEventArgs.data)
    exportStatusDecoded.fold(
      () => {
        console.warn("IngestionStatusReport.rowDataBound", "Failed to parse row data", {
          data: rowDataBoundEventArgs.data,
          message: reporter(exportStatusDecoded),
        })
        return null
      },
      (exportStatus) => {
        const data = rowDataBoundEventArgs.data as ExportStatus
        if (!rowDataBoundEventArgs.row) {
          return
        }
        if (isSelectedPartnerExport(fromStore.selectedPartner)(data))
          rowDataBoundEventArgs.row.classList.add("highlight-row")
      }
    )
  }

  return (
    <UserInterfaceContext.Provider value={contextManager}>
      <>
        <Helmet>
          <title>Import Ingestion Live Report</title>
        </Helmet>

        <PageHeader
          style={{ padding: "15px" }}
          subTitle=""
          title="Import Ingestion"
          className="import-ingestion-report">
          <Row gutter={32}>
            <Col span={4}>
              <Typography.Text strong={true} className={"table-title"}>
                Partners
              </Typography.Text>
              <Query<PartnerStatus>
                getRootUserInterfaceData={() => void 0}
                onChangeRootData={() => void 0}
                queryType="remote-query"
                remoteQuery={partnerQueryId}
                refresh={{ interval: 120, stopOnFailure: true }}
                getDefinitionDefaultValue={BaseInterfaceComponent.getDefinitionDefaultValue}>
                {partnerMenu}
              </Query>
            </Col>
            <Col span={12}>
              <Query<IngestionStatus>
                getRootUserInterfaceData={() => void 0}
                onChangeRootData={() => void 0}
                queryType="remote-query"
                refresh={{ interval: 30, stopOnFailure: true }}
                remoteQuery={ingestionStatusQueryConfigId}
                getDefinitionDefaultValue={BaseInterfaceComponent.getDefinitionDefaultValue}>
                {({ data }) => (
                  <ImportIngestionTable
                    title="Ingestion"
                    data={sortByPartner(data, isSelectedPartnerImportIngestion(selectedPartnerTables))}
                    onRowDataBind={importIngestionRowDataBound}
                  />
                )}
              </Query>
            </Col>
            <Col span={8}>
              <Query<ExportStatus>
                getRootUserInterfaceData={() => void 0}
                onChangeRootData={() => void 0}
                queryType="remote-query"
                refresh={{ interval: 30, stopOnFailure: true }}
                remoteQuery={exportStatusQueryConfigId}
                getDefinitionDefaultValue={BaseInterfaceComponent.getDefinitionDefaultValue}>
                {({ data }) => (
                  <ExportTable
                    title="Export"
                    data={sortByPartner(data, isSelectedPartnerExport(fromStore.selectedPartner))}
                    onRowDataBind={exportRowDataBound}
                  />
                )}
              </Query>
            </Col>
          </Row>
        </PageHeader>
      </>
      <PageBeacon
        data={{
          reportId: null,
          appName: "Legacy Site",
          pageTitle: "Reports - Import Ingestion",
        }}
        pageReady={true}
      />
    </UserInterfaceContext.Provider>
  )
}

export default ImportIngestionReportView
