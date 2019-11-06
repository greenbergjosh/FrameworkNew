import * as Reach from "@reach/router"
import {
  Button,
  Card,
  Col,
  Empty,
  PageHeader,
  Row,
  Typography
  } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import JSON5 from "json5"
import React from "react"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { useRematch } from "../../hooks"
import { store } from "../../state/store"
import { BusinessApplicationConfig, BusinessApplicationId } from "./business-application.types"

export interface BusinessApplicationProps {
  applicationId: BusinessApplicationId
  businessApplicationConfig: BusinessApplicationConfig
  title: string
}

/** Default rendering of a business application */
export const DefaultBusinessApplication = ({
  applicationId,
  businessApplicationConfig,
  title,
}: BusinessApplicationProps): JSX.Element => {
  const [fromStore, dispatch] = useRematch((s) => ({
    configsById: store.select.globalConfig.configsById(s),
    globalConfigPath: s.navigation.routes.dashboard.subroutes["global-config"].abs,
    reportPath: s.navigation.routes.dashboard.subroutes["reports"].abs,
  }))

  console.log("BusinessApplication.render", {
    applicationId,
    businessApplicationConfig,
  })

  return (
    <div>
      <PageHeader
        extra={
          applicationId && (
            <Button.Group size="small">
              <Button>
                <Reach.Link to={`${fromStore.globalConfigPath}/${applicationId}`}>
                  View Config
                </Reach.Link>
              </Button>
            </Button.Group>
          )
        }
        style={{ padding: "15px" }}
        subTitle={businessApplicationConfig.description}
        title={title}>
        <Row>
          <Col span={12}>
            <Card title="Reports" bordered={false}>
              {businessApplicationConfig.report.length ? (
                businessApplicationConfig.report.map((reportId) => {
                  const reportRecord = record.lookup(reportId.toLowerCase(), fromStore.configsById)
                  return reportRecord
                    .map((report) => (
                      <div key={report.id}>
                        <Reach.Link to={`${fromStore.reportPath}/${report.id}`}>
                          {report.name}
                        </Reach.Link>
                      </div>
                    ))
                    .toNullable()
                })
              ) : (
                <Empty description="No Configured Reports" />
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Contacts" bordered={false}>
              {businessApplicationConfig.owner.length ? (
                businessApplicationConfig.owner.map((ownerId) => {
                  const ownerRecord = record.lookup(ownerId.toLowerCase(), fromStore.configsById)
                  return ownerRecord
                    .map((owner) => (
                      <div key={owner.id}>
                        <Reach.Link to={`${fromStore.globalConfigPath}/${owner.id}`}>
                          {owner.name}
                        </Reach.Link>
                      </div>
                    ))
                    .toNullable()
                })
              ) : (
                <Empty description="No Configured Contacts" />
              )}
            </Card>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Card title="Administration" bordered={false}>
              {businessApplicationConfig.administered_types.length ? (
                businessApplicationConfig.administered_types.map(({ label, configType }) => {
                  const administeredTypeRecord = record.lookup(
                    configType.toLowerCase(),
                    fromStore.configsById
                  )
                  return administeredTypeRecord
                    .map((administeredType) => (
                      <div key={administeredType.id}>
                        <Reach.Link
                          to={`${fromStore.globalConfigPath}?configTypeFilters=${encodeURI(
                            administeredType.name
                          )}&configNameFilterVal=`}>
                          {label}
                        </Reach.Link>
                      </div>
                    ))
                    .toNullable()
                })
              ) : (
                <Empty description="No Types to Administrate" />
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Application Configs" bordered={false}>
              {businessApplicationConfig.application_config.length ? (
                businessApplicationConfig.application_config.map((applicationConfigId) => {
                  const applicationConfigRecord = record.lookup(
                    applicationConfigId.toLowerCase(),
                    fromStore.configsById
                  )
                  return applicationConfigRecord
                    .map((applicationConfig) => (
                      <div key={applicationConfig.id}>
                        <Reach.Link to={`${fromStore.globalConfigPath}/${applicationConfig.id}`}>
                          {applicationConfig.name}
                        </Reach.Link>
                      </div>
                    ))
                    .toNullable()
                })
              ) : (
                <Empty description="No Configured Application Configs" />
              )}
            </Card>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Card title="Import & Ingestion" bordered={false}>
              {businessApplicationConfig.ingest_config.length ? (
                businessApplicationConfig.ingest_config.map((ingestConfigId) => {
                  const ingestConfigRecord = record.lookup(
                    ingestConfigId.toLowerCase(),
                    fromStore.configsById
                  )
                  return ingestConfigRecord
                    .map((ingestConfig) => (
                      <div key={ingestConfig.id}>
                        <Reach.Link to={`${fromStore.globalConfigPath}/${ingestConfig.id}`}>
                          {ingestConfig.name}
                        </Reach.Link>
                      </div>
                    ))
                    .toNullable()
                })
              ) : (
                <Empty description="No Configured Import / Ingest" />
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Export" bordered={false}>
              {businessApplicationConfig.export_config.length ? (
                businessApplicationConfig.export_config.map((exportConfigId) => {
                  const exportConfigRecord = record.lookup(
                    exportConfigId.toLowerCase(),
                    fromStore.configsById
                  )
                  return exportConfigRecord
                    .map((exportConfig) => (
                      <div key={exportConfig.id}>
                        <Reach.Link to={`${fromStore.globalConfigPath}/${exportConfig.id}`}>
                          {exportConfig.name}
                        </Reach.Link>
                      </div>
                    ))
                    .toNullable()
                })
              ) : (
                <Empty description="No Configured Exports" />
              )}
            </Card>
          </Col>
        </Row>
      </PageHeader>
    </div>
  )
}
