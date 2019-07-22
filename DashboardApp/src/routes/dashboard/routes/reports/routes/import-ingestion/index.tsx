import {
  AutoComplete,
  Col,
  Menu,
  PageHeader,
  Row,
  Table,
  Typography
  } from "antd"
import * as record from "fp-ts/lib/Record"
import { sortBy } from "lodash/fp"
import React from "react"
import { Helmet } from "react-helmet"
import { FilteredMenu } from "../../../../../../components/filtered-menu/FilteredMenu"
import { Query, QueryProps } from "../../../../../../components/query/Query"
import { useRematch } from "../../../../../../hooks"
import { IngestionStatus, PartnerStatus } from "../../../../../../state/import-ingestion-report"
import { WithRouteProps } from "../../../../../../state/navigation"
import { store } from "../../../../../../state/store"
import {
  importIngestionColumns,
  rawDataColumns,
  tableSettings,
  PARTNER_QUERY_CONFIG_ID,
  INGESTION_STATUS_QUERY_CONFIG_ID
} from "./config"
import "./import-ingestion.scss"
import { exportData, rawData } from "./mock-data"
import {
  createUIContext,
  UserInterfaceContext,
} from "../../../../../../components/interface-builder/UserInterfaceContextManager"

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
        fromStore.configsById
      ),
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
            console.log("index", selected)
            dispatch.importIngestionReport.updateSelectedPartner(selected ? selected : null)
          }}
          selected={fromStore.selectedPartner}
        />
      </>
    ),
    [fromStore.selectedPartner && fromStore.selectedPartner.id]
  )

  return (
    <UserInterfaceContext.Provider value={contextManager}>
      <>
        <Helmet>
          <title>Import Ingestion Live Report</title>
        </Helmet>

        <PageHeader style={{ padding: "15px" }} subTitle="" title="Import Ingestion">
          <Row gutter={16}>
            <Col span={4}>
              <Typography.Text strong={true}>Partners</Typography.Text>
              <Query<PartnerStatus>
                queryType="remote-query"
                remoteQuery={partnerQueryId}
                refresh={{ interval: 120, stopOnFailure: true }}>
                {partnerMenu}
              </Query>
            </Col>
            <Col span={7}>
              <Typography.Text strong={true}>Import</Typography.Text>
              <Table
                {...tableSettings}
                dataSource={rawData}
                columns={rawDataColumns}
                size={"middle"}
                pagination={false}
              />
            </Col>
            <Col span={7}>
              <Typography.Text strong={true}>Ingestion</Typography.Text>
              <Query<IngestionStatus>
                queryType="remote-query"
                refresh={{ interval: 30, stopOnFailure: true }}
                remoteQuery={ingestionStatusQueryConfigId}>
                {({ data }) => (
                  <Table<IngestionStatus>
                    {...tableSettings}
                    onRow={(record) => {
                      return {
                        className: !record.succeeded
                          ? "error-row"
                          : selectedPartnerTables.includes(record.table_name)
                          ? "highlight-row"
                          : "",
                      }
                    }}
                    dataSource={
                      fromStore.selectedPartner
                        // We're using sortBy to move the items of the selected table to the front
                        // without re-arranging anything else
                        ? sortBy(
                            ({ table_name }) => //eslint-disable-line @typescript-eslint/camelcase
                              selectedPartnerTables.includes(table_name)
                                ? 1
                                : 2,
                            data
                          )
                        : data
                    }
                    columns={importIngestionColumns}
                    size={"middle"}
                    scroll={{ y: 800 }}
                  />
                )}
              </Query>
            </Col>
            <Col span={6}>
              <Typography.Text strong={true}>Export</Typography.Text>
              <Table
                {...tableSettings}
                dataSource={exportData as any}
                columns={importIngestionColumns}
                size={"middle"}
                pagination={false}
              />
            </Col>
          </Row>
        </PageHeader>
      </>
    </UserInterfaceContext.Provider>
  )
}

export default ImportIngestionReportView
