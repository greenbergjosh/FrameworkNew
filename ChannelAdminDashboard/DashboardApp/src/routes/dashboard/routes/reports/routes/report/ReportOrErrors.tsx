import * as Reach from "@reach/router"
import { Typography } from "antd"
import { Either } from "fp-ts/lib/Either"
import { fromEither as optionFromEither, Option } from "fp-ts/lib/Option"
import * as these from "fp-ts/lib/These"
import { Errors } from "io-ts"
import React from "react"
import { None, Some } from "../../../../../../data/Option"
import { LocalReportConfig, QueryConfig } from "../../../../../../data/Report"
import { Both, That, This } from "../../../../../../data/These"
import { useRematch } from "../../../../../../hooks"
import styles from "./ReportOrErrors.module.scss"

interface Props {
  children: (reportConfig: LocalReportConfig, queryConfig: QueryConfig) => JSX.Element
  reportConfig: Option<Either<Errors, LocalReportConfig>>
  reportId: Option<string>
  queryConfig: Option<Either<Errors, QueryConfig>>
}

export const ReportOrErrors = React.memo(
  ({ children, reportConfig, reportId, queryConfig }: Props) => {
    const [fromStore, dispatch] = useRematch((state) => ({
      globalConfigPath: state.navigation.routes.dashboard.subroutes["global-config"].abs,
    }))

    const id = reportId.getOrElse("NestedReport")

    return (
      <div className={`${styles.reportBodyContainer}`}>
        {these.fromOptions(reportConfig, queryConfig).foldL(
          None(() => (
            <Typography.Text type="danger">{`No configuration found for ${id}`}</Typography.Text>
          )),

          Some((theseEithers) => {
            return theseEithers.fold(
              This((reportConfig1) => (
                <Typography.Text type="danger">{`No query found for ${id}`}</Typography.Text>
              )),

              That((queryConfig1) => (
                <Typography.Text type="danger">
                  {`No configuration found for Report config with id ${id}`}
                </Typography.Text>
              )),

              Both((reportConfig1, queryConfig1) =>
                these
                  .fromOptions(optionFromEither(reportConfig1), optionFromEither(queryConfig1))
                  .foldL(
                    None(() => (
                      <>
                        <Typography.Paragraph type="danger">
                          {`Unable to parse Report config with id ${id}}`}
                        </Typography.Paragraph>
                        <Typography.Paragraph type="danger">
                          {`Unable to parse Report.Query config associated with Report config with id ${id}`}
                          {console.debug("ReportOrErrors", {
                            report: reportConfig1,
                            query: queryConfig1,
                          })}
                        </Typography.Paragraph>
                      </>
                    )),

                    Some((theseConfigs) =>
                      theseConfigs.fold(
                        This((reportConfig3) => (
                          <Typography.Paragraph type="danger">
                            {`Unable to parse Report.Query config associated with Report config with id `}
                            {reportId.foldL(
                              () => (
                                <>id</>
                              ),
                              (rId) => (
                                <Reach.Link to={`${fromStore.globalConfigPath}/${rId}`}>
                                  {rId}
                                </Reach.Link>
                              )
                            )}
                            {console.debug("ReportOrErrors", {
                              report: reportConfig1,
                              query: queryConfig1,
                            })}
                          </Typography.Paragraph>
                        )),

                        That((queryConfig3) => (
                          <Typography.Paragraph type="danger">
                            {`Unable to parse Report config with id ${id}`}
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
      </div>
    )
  }
)
