import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { QueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { getQueryConfig, getResultDataFromReportData, mergeResultDataWithModel } from "../utils"
import { QueryForm } from "../../../../query/QueryForm"
import { OnSubmitType, RemoteQueryProps } from "../../types"
import { QueryParams } from "../../../../query/QueryParams"
import { AdminUserInterfaceContextManager } from "../../../../../data/AdminUserInterfaceContextManager.type"
import { executeRemoteQuery } from "./executeRemoteQuery"

function RemoteQuery(props: RemoteQueryProps): JSX.Element {
  const {
    buttonLabel,
    buttonProps,
    context,
    isCRUD,
    onChangeData,
    onMount,
    outboundValueKey,
    parentSubmitting,
    persistedConfigId,
    setParentSubmitting,
    userInterfaceData,
    valueKey,
  } = props

  /* *************************************
   *
   * STATE
   */

  /* *************************************
   *
   * PROP WATCHERS
   */

  /**
   * Put the query config from Persisted Global Configs into state
   */
  const queryConfig: QueryConfig | undefined = React.useMemo(() => {
    return getQueryConfig(context, persistedConfigId)
  }, [persistedConfigId, context])

  /* *************************************
   *
   * EVENT HANDLERS
   */

  /* Originally from ReportBody.tsx */
  const handleSubmit: OnSubmitType = (parameterValues, satisfiedByParentParams, setParameterValues) => {
    if (!queryConfig) return

    // Send state back up to <QueryParams>
    setParameterValues(some(parameterValues))
    const queryFormValues: JSONRecord = { ...satisfiedByParentParams, ...parameterValues }

    return executeRemoteQuery(
      queryConfig as QueryConfig,
      queryFormValues,
      parameterValues,
      context as AdminUserInterfaceContextManager,
      isCRUD
    ).then((newLoadingState) => {
      const { reportDataByQuery } = context as AdminUserInterfaceContextManager

      // Load the response data from cache
      const resultData = getResultDataFromReportData(queryConfig.query, satisfiedByParentParams, reportDataByQuery)

      // Put response data into userInterfaceData (via onChangeData)
      if (onChangeData) {
        const newData = mergeResultDataWithModel({
          outboundValueKey,
          parameterValues,
          queryConfigQuery: queryConfig.query,
          resultData,
          userInterfaceData,
        })
        onChangeData(newData)
      }
    })
  }

  /* *************************************
   *
   * RENDER METHOD
   */

  if (!queryConfig)
    return (
      <Empty
        description="Please configure a Data Source for this Execute component"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )

  return (
    <QueryParams queryConfig={queryConfig} parentData={userInterfaceData}>
      {({ parameterValues, satisfiedByParentParams, setParameterValues, unsatisfiedByParentParams }) => (
        <QueryForm
          layout={queryConfig.layout}
          onSubmit={(queryFormValues) => handleSubmit(queryFormValues, satisfiedByParentParams, setParameterValues)}
          onMount={(queryFormValues) =>
            onMount(() => handleSubmit(queryFormValues, satisfiedByParentParams, setParameterValues))
          }
          parameters={unsatisfiedByParentParams}
          parameterValues={parameterValues.getOrElse(record.empty)}
          submitButtonLabel={buttonLabel || "Save"}
          submitButtonProps={buttonProps}
          parentSubmitting={parentSubmitting}
          setParentSubmitting={setParentSubmitting}
        />
      )}
    </QueryParams>
  )
}

export default RemoteQuery
