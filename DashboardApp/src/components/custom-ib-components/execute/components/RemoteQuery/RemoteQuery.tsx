import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { QueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { getQueryConfig, getQueryFormValues, mergeResultDataWithModel } from "../utils"
import { QueryForm } from "../../../../query/QueryForm"
import { OnSubmitType, RemoteQueryFromStore, RemoteQueryProps, ErrorResponse } from "../../types"
import { QueryParams } from "../../../../query/QueryParams"
import { AppDispatch } from "../../../../../state/store.types"
import { useRematch } from "../../../../../hooks"
import { store } from "../../../../../state/store"
import { executeRemoteQuery } from "./executeRemoteQuery"

function RemoteQuery(props: RemoteQueryProps): JSX.Element {
  const {
    buttonLabel,
    buttonProps,
    getParams,
    getRootUserInterfaceData,
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

    /*
     * From ReportBody.tsx
     * Send parameterValues back up to <QueryParams>
     * (Unknown why this is being done)
     */
    setParameterValues(some(parameterValues))
    const queryFormValues: JSONRecord = getQueryFormValues(queryConfig, satisfiedByParentParams, parameterValues)

    return executeRemoteQuery(queryConfig as QueryConfig, queryFormValues, dispatch, isCRUD).then((newLoadingState) => {
      // Put response data into userInterfaceData (via onChangeData)

      // TODO: Move this error checking to the DAL and expect server to respond
      //  like previously defined api responses in the DAL codecs.
      const dataStatus = (newLoadingState.data as unknown) as ErrorResponse
      if (dataStatus && dataStatus.status && dataStatus.status === "error") {
        dispatch.feedback.notify({
          type: "error",
          message: `Remote Query failed. The server responded with an error: ${dataStatus.error}`,
        })
        console.error("RemoteQuery API responded with an error", dataStatus.error)
        return
      }

      if (onChangeData) {
        const newData = mergeResultDataWithModel({
          getRootUserInterfaceData,
          outboundValueKey,
          parameterValues,
          queryConfigQuery: queryConfig.query,
          resultData: newLoadingState.data,
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

  const params = getParams()

  return (
    <QueryParams queryConfig={queryConfig} parentData={params}>
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
