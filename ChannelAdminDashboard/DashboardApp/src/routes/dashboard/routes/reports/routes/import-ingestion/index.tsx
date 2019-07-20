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
import { importExportDataColumns, rawDataColumns, tableSettings } from "./config"
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
    // selectPartners
    // selectRawData
    // selectImport
    // selectExport
  }))

  // React.useEffect invoke 4 data calls
  // setTimeout return a cleanup fn for unmount, call and reset the interval
  // increment counter (React.useState) | or lastRequestedTS

  const partnerQueryConfig = record
    .lookup("a3987b6c-3121-4a25-a781-60ff4c4eef25", fromStore.configsById)
    .toUndefined()
  const partnerQueryId = partnerQueryConfig && partnerQueryConfig.id

  const ingestionStatusQueryConfig = record
    .lookup("2327834e-9c0f-4d58-85f8-a774c1520984", fromStore.configsById)
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
        {/* <AutoComplete
          style={{ width: 200 }}
          dataSource={data.map(({ name }) => name)}
          placeholder="Type to Search for Providers"
          filterOption={(inputValue, option) =>
            !!option &&
            !!option.props &&
            String(option.props.children)
              .toUpperCase()
              .indexOf(inputValue.toUpperCase()) !== -1
          }
        />
        <Menu
          style={{ minHeight: 200 }}
          onClick={(selected) => {
            const selectedPartner = data.find(({ id }) => id === selected.key)
            console.log("index", selected, selectedPartner)
            if (selectedPartner) {
              dispatch.importIngestionReport.updateSelectedPartner(selectedPartner)
            } else {
              dispatch.importIngestionReport.updateSelectedPartner(null)
            }
          }}
          selectedKeys={fromStore.selectedPartner ? [fromStore.selectedPartner.id] : []}>
          <div>Test</div>
          {data && data.map((item) => <Menu.Item key={item.id}>{item.name}</Menu.Item>)}
        </Menu> */}
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
                        ? sortBy(
                            ({ table_name }) =>
                              selectedPartnerTables.includes(table_name)
                                ? "aaaaaaaaaaaaaaaaaaaa"
                                : "zzzzzzzzzzzzzzzzzzzz",
                            data
                          )
                        : data
                    }
                    columns={importExportDataColumns}
                    size={"middle"}
                    scroll={{ y: 800 }}
                  />
                )}
              </Query>

              {/* <Table
                {...tableSettings}
                dataSource={importData}
                columns={importExportDataColumns}
                size={"middle"}
                pagination={false}
              /> */}
            </Col>
            <Col span={6}>
              <Typography.Text strong={true}>Export</Typography.Text>
              <Table
                {...tableSettings}
                dataSource={exportData as any}
                columns={importExportDataColumns}
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
