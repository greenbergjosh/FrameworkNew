import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { QueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { getQueryConfig, getResultDataFromReportData, mergeResultDataWithModel } from "../utils"
import { QueryForm } from "../../../../query/QueryForm"
import { OnSubmitType, RemoteQueryFromStore, RemoteQueryProps } from "../../types"
import { QueryParams } from "../../../../query/QueryParams"
import { executeRemoteQuery } from "./executeRemoteQuery"
import { AppDispatch } from "../../../../../state/store.types"
import { useRematch } from "../../../../../hooks"
import { store } from "../../../../../state/store"

function RemoteQuery(props: RemoteQueryProps): JSX.Element {
  const {
    buttonLabel,
    buttonProps,
    context,
    isCRUD,
    onChangeData,
    onRaiseEvent,
    onMount,
    outboundValueKey,
    parentSubmitting,
    queryConfigId,
    setParentSubmitting,
    userInterfaceData,
  } = props

  /* *************************************
   *
   * STATE
   */

  /* *************************************
   *
   * PROP WATCHERS
   */

  const [fromStore, dispatch]: [RemoteQueryFromStore, AppDispatch] = useRematch((appState) => ({
    reportDataByQuery: appState.reports.reportDataByQuery,
    loadById: (id: string) => {
      return record.lookup(id, store.select.globalConfig.configsById(appState)).toNullable()
    },
  }))

  /**
   * Put the query config from Persisted Global Configs into state
   */
  const queryConfig: QueryConfig | undefined = React.useMemo(() => {
    return getQueryConfig(fromStore, queryConfigId)
  }, [queryConfigId, fromStore])

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

    return executeRemoteQuery(queryConfig as QueryConfig, queryFormValues, dispatch, isCRUD).then((newLoadingState) => {
      // Load the response data from cache
      const resultData = getResultDataFromReportData(
        queryConfig.query,
        satisfiedByParentParams,
        context.reportDataByQuery
      )

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

      switch (newLoadingState.loadStatus) {
        case "created":
          onRaiseEvent("remoteQuery_created", { value: newLoadingState.data })
          break
        case "deleted":
          onRaiseEvent("remoteQuery_deleted", { value: newLoadingState.data })
          break
        case "loaded":
          onRaiseEvent("remoteQuery_loaded", { value: newLoadingState.data })
          break
        case "updated":
          onRaiseEvent("remoteQuery_updated", { value: newLoadingState.data })
          break
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
