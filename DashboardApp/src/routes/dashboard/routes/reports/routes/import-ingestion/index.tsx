import React from "react"
import { Col, PageHeader, Row, Typography } from "antd"
import * as record from "fp-ts/lib/Record"
import { sortBy } from "lodash/fp"
import { Helmet } from "react-helmet"
import { FilteredMenu } from "../../../../../../components/filtered-menu/FilteredMenu"
import { Query, QueryProps } from "../../../../../../components/query/Query"
import { useRematch } from "../../../../../../hooks"
import { IngestionStatus, PartnerStatus } from "../../../../../../state/import-ingestion-report"
import { WithRouteProps } from "../../../../../../state/navigation"
import { store } from "../../../../../../state/store"
import {
  createUIContext,
  UserInterfaceContext,
} from "../../../../../../components/interface-builder/UserInterfaceContextManager"
import { INGESTION_STATUS_QUERY_CONFIG_ID, PARTNER_QUERY_CONFIG_ID } from "./constants"
import { exportData } from "./mock-data"
import ImportIngestionTable from "./ImportIngestionTable"
import "./import-ingestion.scss"

interface Props {
  selectedPartner: string
}

export function ImportIngestionReportView(props: WithRouteProps<Props>): JSX.Element {
  console.log("ImportIngestionReportView.render")

  const [fromStore, dispatch] = useRematch((state) => ({
    configsById: store.select.globalConfig.configsById(state),
    configs: state.globalConfig.configs,
    selectedPartner: state.importIngestionReport.selectedPartner,
    reportDataByQuery: state.reports.reportDataByQuery,
  }))

  // React.useEffect invoke 4 data calls
  // setTimeout return a cleanup fn for unmount, call and reset the interval
  // increment counter (React.useState) | or lastRequestedTS

  const partnerQueryConfig = record
    .lookup(PARTNER_QUERY_CONFIG_ID, fromStore.configsById)
    .toUndefined()
  const partnerQueryId = partnerQueryConfig && partnerQueryConfig.id

  const ingestionStatusQueryConfig = record
    .lookup(INGESTION_STATUS_QUERY_CONFIG_ID, fromStore.configsById)
    .toUndefined()
  const ingestionStatusQueryConfigId = ingestionStatusQueryConfig && ingestionStatusQueryConfig.id

  const contextManager = React.useMemo(
    () =>
      createUIContext(
        dispatch,
        fromStore.reportDataByQuery,
        fromStore.configs,
        fromStore.configsById,
      ),
    [dispatch, fromStore.reportDataByQuery, fromStore.configs, fromStore.configsById],
  )

  console.log("index.render", "Selected", fromStore.selectedPartner)
  const selectedPartnerTables = React.useMemo(
    () =>
      fromStore.selectedPartner && fromStore.selectedPartner.Tables
        ? Object.keys(fromStore.selectedPartner.Tables)
        : [],
    [fromStore.selectedPartner],
  )

  const partnerMenu = React.useCallback<QueryProps<PartnerStatus>["children"]>(
    ({ data }) => (
      <>
        <FilteredMenu
          data={data}
          labelAccessor="name"
          valueAccessor="id"
          onSelect={(selected) => {
            console.log("index", selected)
            dispatch.importIngestionReport.updateSelectedPartner(selected ? selected : null)
          }}
          selected={fromStore.selectedPartner}
          inputClassName={"partner-filter"}
        />
      </>
    ),
    [fromStore.selectedPartner && fromStore.selectedPartner.id],
  )

  function sortByPartner(data: IngestionStatus[]) {
    return fromStore.selectedPartner
      // We're using sortBy to move the items of the selected table to the front
      // without re-arranging anything else
      ? sortBy(
        ({ table_name }) => //eslint-disable-line @typescript-eslint/camelcase
          selectedPartnerTables.includes(table_name)
            ? 1
            : 2,
        data,
      )
      : data
  }

  function rowDataBound(args?: any): void {
    if (!args.data.succeeded)
      args.row.classList.add("error-row")
    else if (selectedPartnerTables.includes(args.data.table_name))
      args.row.classList.add("highlight-row")
  }

  return (
    <UserInterfaceContext.Provider value={contextManager}>
      <>
        <Helmet>
          <title>Import Ingestion Live Report</title>
        </Helmet>

        <PageHeader style={{ padding: "15px" }} subTitle="" title="Import Ingestion" className="import-ingestion-report">
          <Row gutter={32}>
            <Col span={4}>
              <Typography.Text strong={true} className={"table-title"}>Partners</Typography.Text>
              <Query<PartnerStatus>
                queryType="remote-query"
                remoteQuery={partnerQueryId}
                refresh={{ interval: 120, stopOnFailure: true }}>
                {partnerMenu}
              </Query>
            </Col>
            <Col span={12}>
              <Query<IngestionStatus>
                queryType="remote-query"
                refresh={{ interval: 30, stopOnFailure: true }}
                remoteQuery={ingestionStatusQueryConfigId}>
                {({ data }) => (
                  <ImportIngestionTable<IngestionStatus> title="Ingestion" data={sortByPartner(data)}
                                                         rowDataBound={rowDataBound}/>
                )}
              </Query>
            </Col>
            <Col span={8}>
              <ImportIngestionTable<typeof exportData[0]> title="Export" data={exportData} rowDataBound={rowDataBound}/>
            </Col>
          </Row>
        </PageHeader>
      </>
    </UserInterfaceContext.Provider>
  )
}

export default ImportIngestionReportView
