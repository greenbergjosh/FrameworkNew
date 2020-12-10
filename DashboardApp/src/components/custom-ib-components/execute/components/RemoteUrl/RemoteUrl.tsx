import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { HTTPRequestQueryConfig, QueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { getQueryConfig, getQueryFormValues, mergeResultDataWithModel } from "../utils"
import { QueryForm } from "../../../../query/QueryForm"
import { OnSubmitType, RemoteUrlFromStore, RemoteUrlProps } from "../../types"
import { QueryParams } from "../../../../query/QueryParams"
import { AppDispatch } from "../../../../../state/store.types"
import { useRematch } from "../../../../../hooks"
import { store } from "../../../../../state/store"
import { executeRemoteUrl } from "./executeRemoteUrl"

function RemoteUrl(props: RemoteUrlProps): JSX.Element {
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

  const [fromStore, dispatch]: [RemoteUrlFromStore, AppDispatch] = useRematch((appState) => ({
    reportDataByQuery: appState.reports.reportDataByQuery,
    loadById: (id: string) => {
      return record.lookup(id, store.select.globalConfig.configsById(appState)).toNullable()
    },
  }))

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
    return getQueryConfig(fromStore, queryConfigId, defaults)
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

    return executeRemoteUrl(queryConfig as HTTPRequestQueryConfig, queryFormValues, dispatch, isCRUD).then(
      (newLoadingState) => {
        // Put response data into userInterfaceData (via onChangeData)
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
            onRaiseEvent("remoteUrl_created", { value: newLoadingState.data })
            break
          case "deleted":
            onRaiseEvent("remoteUrl_deleted", { value: newLoadingState.data })
            break
          case "loaded":
            onRaiseEvent("remoteUrl_loaded", { value: newLoadingState.data })
            break
          case "updated":
            onRaiseEvent("remoteUrl_updated", { value: newLoadingState.data })
            break
        }
      }
    )
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

export default RemoteUrl
