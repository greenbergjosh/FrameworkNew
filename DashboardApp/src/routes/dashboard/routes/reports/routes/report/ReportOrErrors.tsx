import React from "react"
import * as Reach from "@reach/router"
import * as these from "fp-ts/lib/These"
import { None, Some } from "../../../../../../data/Option"
import { Typography, Card } from "antd"
import { Both, That, This } from "../../../../../../data/These"
import { fromEither as optionFromEither, Option } from "fp-ts/lib/Option"
import { LocalReportConfig, QueryConfig } from "../../../../../../data/Report"
import { Errors } from "io-ts"
import { Either } from "fp-ts/lib/Either"
import { useRematch } from "../../../../../../hooks"

interface Props {
  children: (reportConfig: LocalReportConfig, queryConfig: QueryConfig) => JSX.Element
  reportConfig: Option<Either<Errors, LocalReportConfig>>
  reportId: string
  queryConfig: Option<Either<Errors, QueryConfig>>
}

export const ReportOrErrors = ({ children, reportConfig, reportId, queryConfig }: Props) => {
  const [fromStore, dispatch] = useRematch((state) => ({
    globalConfigPath: state.navigation.routes.dashboard.subroutes["global-config"].abs,
  }))

  return (
    <Card size="small">
      {these.fromOptions(reportConfig, queryConfig).foldL(
        None(() => (
          <Typography.Text type="danger">{`No configuration found for ${reportId}`}</Typography.Text>
        )),

        Some((theseEithers) => {
          return theseEithers.fold(
            This((reportConfig1) => (
              <Typography.Text type="danger">{`No query found for ${reportId}`}</Typography.Text>
            )),

            That((queryConfig1) => (
              <Typography.Text type="danger">
                {`No configuration found for Report config with id ${reportId}`}
              </Typography.Text>
            )),

            Both((reportConfig1, queryConfig1) =>
              these
                .fromOptions(optionFromEither(reportConfig1), optionFromEither(queryConfig1))
                .foldL(
                  None(() => (
                    <>
                      <Typography.Paragraph type="danger">
                        {`Unable to parse Report config with id ${reportId}}`}
                      </Typography.Paragraph>
                      <Typography.Paragraph type="danger">
                        {`Unable to parse Report.Query config associated with Report config with id ${reportId}`}
                      </Typography.Paragraph>
                    </>
                  )),

                  Some((theseConfigs) =>
                    theseConfigs.fold(
                      This((reportConfig3) => (
                        <Typography.Paragraph type="danger">
                          {`Unable to parse Report.Query config associated with Report config with id `}
                          <Reach.Link to={`${fromStore.globalConfigPath}/${reportId}`}>
                            {reportId}
                          </Reach.Link>
                        </Typography.Paragraph>
                      )),

                      That((queryConfig3) => (
                        <Typography.Paragraph type="danger">
                          {`Unable to parse Report config with id ${reportId}`}
                        </Typography.Paragraph>
                      )),

                      Both(children)
                    )
                  )
                )
            )
          )
        })
      )}
    </Card>
  )
}
