import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import React from "react"
import { HTTPRequestQueryConfig, QueryConfig } from "../../../../api/ReportCodecs"
import { JSONRecord } from "../../../../lib/JSONRecord"
import { getQueryConfig, getQueryFormValues } from "../utils"
import { RemoteUrlProps } from "../../types"
import { QueryParams } from "../../query/QueryParams"
import { executeRemoteUrl } from "./executeRemoteUrl"
import { OnSubmitType } from "../../query/types"

function RemoteUrl(props: RemoteUrlProps): JSX.Element {
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
    executeHTTPRequestQuery,
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
    const defaults = {
      method: "GET",
      body: {
        format: "raw",
        lang: "json",
        raw: "",
      },
      headers: {},
    }
    return getQueryConfig({ loadById, persistedConfigId: queryConfigId, defaults })
  }, [queryConfigId, loadById])

  /* *************************************
   *
   * EVENT HANDLERS
   */

  /* Originally from ReportBody.tsx */
  const handleSubmit: OnSubmitType = (parameterValues, satisfiedByParentParams, setParameterValues) => {
    if (!queryConfig || mode === "edit") return

    /*
     * Send parameterValues back up to <QueryParams>
     * (Unknown why this is being done)
     */
    setParameterValues(some(parameterValues))
    const queryFormValues: JSONRecord = getQueryFormValues(queryConfig, satisfiedByParentParams, parameterValues)

    return executeRemoteUrl(
      queryConfig as HTTPRequestQueryConfig,
      queryFormValues,
      executeHTTPRequestQuery,
      isCRUD,
      notifyOkShow,
      notifyUnauthorizedShow,
      notifyServerExceptionShow
    ).then((newLoadingState) => {
      // Put response data into userInterfaceData (via onResults)
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
      onChangeRootData={onChangeRootData}
      layout={queryConfig.layout}
      onSubmit={handleSubmit}
      onMount={handleSubmit}
      parentSubmitting={parentSubmitting}
      setParentSubmitting={setParentSubmitting}
      getDefinitionDefaultValue={getDefinitionDefaultValue}
    />
  )
}

export default RemoteUrl
