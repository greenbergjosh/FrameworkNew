import { Empty, notification } from "antd"
import { some } from "fp-ts/lib/Option"
import React from "react"
import { QueryConfig } from "../../../../api/ReportCodecs"
import { JSONRecord } from "../../../../lib/JSONRecord"
import { getQueryConfig, getQueryFormValues } from "../utils"
import { ErrorResponse, LOADSTATUSCODES, RemoteQueryProps } from "../../types"
import { QueryParams } from "../../query/QueryParams"
import { executeRemoteQuery } from "./executeRemoteQuery"
import { OnSubmitType } from "../../query/types"

function RemoteQuery(props: RemoteQueryProps): JSX.Element {
  const {
    getParams,
    getRootUserInterfaceData,
    onChangeRootData,
    isCRUD,
    notifyOkShow,
    notifyUnauthorizedShow,
    notifyServerExceptionShow,
    mode,
    onResults,
    onRaiseEvent,
    onMount,
    parentSubmitting,
    queryConfigId,
    setParentSubmitting,
    loadById,
    executeQuery,
    executeQueryUpdate,
    getDefinitionDefaultValue,
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
    return getQueryConfig({ loadById, persistedConfigId: queryConfigId })
  }, [queryConfigId, loadById])

  /* *************************************
   *
   * EVENT HANDLERS
   */

  const handleSubmit: OnSubmitType = (parameterValues, satisfiedByParentParams, setParameterValues) => {
    if (!queryConfig || mode === "edit") return
    onRaiseEvent(LOADSTATUSCODES.loading, { value: {} })

    /*
     * Send parameterValues back up to <QueryParams>
     * (Unknown why this is being done)
     */
    setParameterValues(some(parameterValues))
    const queryFormValues: JSONRecord = getQueryFormValues(queryConfig, satisfiedByParentParams, parameterValues)

    return executeRemoteQuery(
      queryConfig as QueryConfig,
      queryFormValues,
      executeQuery,
      executeQueryUpdate,
      isCRUD,
      notifyOkShow,
      notifyUnauthorizedShow,
      notifyServerExceptionShow
    ).then((newLoadingState) => {
      // Put response data into userInterfaceData (via onResults)

      // TODO: Move this error checking to the DAL and expect server to respond
      //  like previously defined api responses in the DAL codecs.
      const dataStatus = newLoadingState.data as unknown as ErrorResponse
      if (dataStatus && dataStatus.status && dataStatus.status === "error") {
        notification.error({
          type: "error",
          message: `Remote Query failed. The server responded with an error: ${dataStatus.error}`,
          duration: 10,
        })
        console.error("RemoteQuery API responded with an error", dataStatus.error)
        return
      }

      if (onResults) {
        onResults(newLoadingState.data)
      }
      newLoadingState.loadStatus && onRaiseEvent(newLoadingState.loadStatus, { value: newLoadingState.data })
    })
  }

  /* *************************************
   *
   * RENDER
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
    <QueryParams
      queryConfig={queryConfig}
      parentData={params}
      // formerly QueryForm props
      getRootUserInterfaceData={getRootUserInterfaceData}
      layout={queryConfig.layout}
      onChangeRootData={onChangeRootData}
      onSubmit={handleSubmit}
      onMount={handleSubmit}
      parentSubmitting={parentSubmitting}
      setParentSubmitting={setParentSubmitting}
      getDefinitionDefaultValue={getDefinitionDefaultValue}
    />
  )
}

export default RemoteQuery
