import React from "react"
import { Helmet } from "react-helmet"
import { Report } from "../../../../../../components/report/Report"
import { WithRouteProps } from "../../../../../../state/navigation"
import { Col, Empty, PageHeader, Row, Table, Typography } from "antd"
import * as Reach from "@reach/router"
import { partners, rawData, importData, exportData } from "./mock-data"
import { tableSettings, partnerColumns, rawDataColumns, importExportDataColumns } from "./config"
import { none } from "fp-ts/lib/Option"
import { useRematch } from "../../../../../../hooks"
import { store } from "../../../../../../state/store"
import { Partner } from "../../../../../../state/import-ingestion-report"

interface Props {
  selectedPartner: Partner
}

export function ImportIngestionReportView(props: WithRouteProps<Props>): JSX.Element {
  console.log("ImportIngestionReportView.render")

  const [fromStore, dispatch] = useRematch((state) => ({
    selectedPartner: state.importIngestionReport.selectedPartner,
    // selectPartners
    // selectRawData
    // selectImport
    // selectExport
  }))

  // React.useEffect invoke 4 data calls
  // setTimeout return a cleanup fn for unmount, call and reset the interval
  // increment counter (React.useState) | or lastRequestedTS

  return (
    <>
      <Helmet>
        <title>Import Ingestion Live Report</title>
      </Helmet>

      <PageHeader style={{ padding: "15px" }} subTitle="" title="Import Ingestion">
        <Row gutter={16}>
          <Col span={6}>
            <Typography.Text strong={true}>Partners</Typography.Text>
            { /* Use antd Menu */ }
            <Table
              {...tableSettings}
              dataSource={partners}
              columns={partnerColumns}
              size={"middle"}
              pagination={false}
              showHeader={false}
              rowSelection={{
                type: "radio",
                onChange: (selectedRowKeys, selectedRows) => {
                  const partner = selectedRows[0];
                  dispatch.importIngestionReport.setSelectedPartner(partner)
                  console.log('props', props)
                },
              }}
            />
          </Col>
          <Col span={6}>
            <Typography.Text strong={true}>Raw</Typography.Text>
            <Table
              {...tableSettings}
              dataSource={rawData}
              columns={rawDataColumns}
              size={"middle"}
              pagination={false}
            />
          </Col>
          <Col span={6}>
            <Typography.Text strong={true}>Import</Typography.Text>
            <Table
              {...tableSettings}
              dataSource={importData}
              columns={importExportDataColumns}
              size={"middle"}
              pagination={false}
            />
          </Col>
          <Col span={6}>
            <Typography.Text strong={true}>Export</Typography.Text>
            <Table
              {...tableSettings}
              dataSource={exportData}
              columns={importExportDataColumns}
              size={"middle"}
              pagination={false}
            />
          </Col>
        </Row>
      </PageHeader>
    </>
  )
}

export default ImportIngestionReportView
