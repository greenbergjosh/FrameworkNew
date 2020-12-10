import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { QueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { getQueryConfig, getQueryFormValues, mergeResultDataWithModel } from "../utils"
import { QueryForm } from "../../../../query/QueryForm"
import { LoadStatusCode, OnSubmitType, RemoteConfigFromStore, RemoteConfigProps } from "../../types"
import { QueryParams } from "../../../../query/QueryParams"
import { executeRemoteConfig } from "./lib/executeRemoteConfig"
import { useRematch } from "../../../../../hooks"
import { store } from "../../../../../state/store"
import { AppDispatch } from "../../../../../state/store.types"
import { get, isEmpty } from "lodash/fp"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"

function RemoteConfig(props: RemoteConfigProps): JSX.Element {
  const {
    actionType,
    buttonLabel,
    buttonProps,
    deleteRedirectPath,
    entityTypeId,
    getParams,
    getRootUserInterfaceData,
    onChangeData,
    onRaiseEvent,
    onMount,
    outboundValueKey,
    parentSubmitting,
    remoteConfigStaticId,
    resultsType,
    setParentSubmitting,
    useDeleteRedirect,
    userInterfaceData,
  } = props

  /* *************************************
   *
   * STATE
   */
  const [loadStatus, setLoadStatus] = React.useState<LoadStatusCode>("none")

  /* *************************************
   *
   * PROP WATCHERS
   */

  const [fromStore, dispatch]: [RemoteConfigFromStore, AppDispatch] = useRematch((appState) => ({
    configNames: store.select.globalConfig.configNames(appState),
    configs: appState.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(appState),
    configsByType: store.select.globalConfig.configsByType(appState),
    entityTypeConfigs: store.select.globalConfig.entityTypeConfigs(appState),
    defaultEntityTypeConfig: appState.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(appState),
    isDeletingRemoteConfig: appState.loading.effects.globalConfig.deleteRemoteConfigs,
    isUpdatingRemoteConfig: appState.loading.effects.globalConfig.updateRemoteConfig,
    reportDataByQuery: appState.reports.reportDataByQuery,
    loadById: (id: string) => {
      return record.lookup(id, store.select.globalConfig.configsById(appState)).toNullable()
    },
    loadByType: (type: string) => {
      return record.lookup(type, store.select.globalConfig.configsByType(appState)).toNullable()
    },
  }))

  /**
   * IMPORTANT! There only needs to be one queryConfig for use with RemoteConfigs.
   * Therefore, the queryConfig ID is hard-coded instead of coming from props.
   * Put the query config from Persisted Global Configs into state
   */
  const queryConfig: QueryConfig | undefined = React.useMemo(() => {
    const queryConfigId = "97d37ff4-0585-415d-a3af-4bfb9c22b055" as PersistedConfig["id"]
    return getQueryConfig(fromStore, queryConfigId)
  }, [fromStore])

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

    const uiDataSlice: JSONRecord = !isEmpty(outboundValueKey)
      ? get(outboundValueKey, userInterfaceData)
      : userInterfaceData

    return executeRemoteConfig({
      actionType,
      dispatch,
      entityTypeId,
      fromStore,
      queryConfig,
      queryFormValues,
      remoteConfigStaticId,
      resultsType,
      uiDataSlice,
      userInterfaceData,
    }).then((newLoadingState) => {
      if (newLoadingState.loadError) {
        dispatch.feedback.notify({
          type: "error",
          message: newLoadingState.loadError,
        })
        return
      }
      setLoadStatus(newLoadingState.loadStatus)

      // Put response data into userInterfaceData via onChangeData
      if (onChangeData && newLoadingState.loadStatus !== "deleted") {
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
          onRaiseEvent("remoteConfig_created", { value: newLoadingState.data })
          break
        case "deleted":
          onRaiseEvent("remoteConfig_deleted", { value: newLoadingState.data })
          break
        case "loaded":
          onRaiseEvent("remoteConfig_loaded", { value: newLoadingState.data })
          break
        case "updated":
          onRaiseEvent("remoteConfig_updated", { value: newLoadingState.data })
          break
      }
    })
  }

  /**
   * On delete, redirect user somewhere
   */
  React.useEffect(() => {
    if (useDeleteRedirect && loadStatus === "deleted" && deleteRedirectPath && !isEmpty(deleteRedirectPath)) {
      // Wipe out userInterfaceData from this view so it doesn't conflict on the next view
      onChangeData && onChangeData({})
      dispatch.navigation.navigate(deleteRedirectPath)
    }
  }, [dispatch.navigation, loadStatus, useDeleteRedirect, deleteRedirectPath, onChangeData])

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

export default RemoteConfig
