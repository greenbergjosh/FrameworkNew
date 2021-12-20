import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { QueryConfig } from "../../../../api/ReportCodecs"
import { JSONRecord } from "../../../../lib/JSONRecord"
import { getQueryConfig, getQueryFormValues } from "../utils"
import { LoadStatus, LoadStatusCode, LOADSTATUSCODES, RemoteConfigFromStore, RemoteConfigProps } from "../../types"
import { QueryParams } from "../../query/QueryParams"
import { executeRemoteConfig } from "./executeRemoteConfig"
import { useRematch } from "../../../../hooks"
import { store } from "../../../../state/store"
import { AppDispatch } from "../../../../state/store.types"
import { isEmpty, merge } from "lodash/fp"
import { PersistedConfig } from "../../../../api/GlobalConfigCodecs"
import { NotifyConfig } from "../../../../state/feedback"
import { OnSubmitType } from "../../query/types"

function RemoteConfig(props: RemoteConfigProps): JSX.Element {
  const {
    actionType,
    configDefault,
    entityTypeId,
    getDefinitionDefaultValue,
    getParams,
    getRootUserInterfaceData,
    getValue,
    mode,
    onChangeData,
    onChangeRootData,
    onMount,
    onRaiseEvent,
    onResults,
    outboundValueKey,
    parentSubmitting,
    redirectPath,
    remoteConfigStaticId,
    resultsType,
    setParentSubmitting,
    useConfigDefault,
    useRedirect,
    userInterfaceData,
  } = props

  /* *************************************
   *
   * STATE
   */
  const [loadStatus, setLoadStatus] = React.useState<LoadStatusCode>(LOADSTATUSCODES.none)

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

  /* *************************************
   *
   * PROP WATCHERS
   */

  /**
   * IMPORTANT! There only needs to be one queryConfig for use with RemoteConfigs.
   * Therefore, the queryConfig ID is hard-coded instead of coming from props.
   * Put the query config from Persisted Global Configs into state
   */
  const queryConfig: QueryConfig | undefined = React.useMemo(() => {
    /*
     * Type: Report.Query
     * Name: ExecuteComponent.RemoteConfig.Query
     * GUID: 97d37ff4-0585-415d-a3af-4bfb9c22b055
     */
    const queryConfigId = "97d37ff4-0585-415d-a3af-4bfb9c22b055" as PersistedConfig["id"]
    return getQueryConfig({ fromStore, loadById: fromStore.loadById, persistedConfigId: queryConfigId })
  }, [fromStore])

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
    const uiDataSlice: JSONRecord = !isEmpty(outboundValueKey) ? getValue(outboundValueKey) : userInterfaceData

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
        const notifyConfig: NotifyConfig = {
          type: "error",
          message: newLoadingState.loadError,
        }
        dispatch.feedback.notify(notifyConfig)
        return notifyConfig
      }
      setLoadStatus(newLoadingState.loadStatus)

      // Put response data into userInterfaceData via onResults
      const value: LoadStatus["data"] = useConfigDefault
        ? merge(configDefault, newLoadingState.data)
        : newLoadingState.data

      if (onResults) {
        onResults(value)
      }
      newLoadingState.loadStatus && onRaiseEvent(newLoadingState.loadStatus, { value })
    })
  }

  /**
   * On delete, redirect user somewhere
   */
  React.useEffect(() => {
    if (
      useRedirect &&
      (loadStatus === LOADSTATUSCODES.deleted ||
        loadStatus === LOADSTATUSCODES.created ||
        loadStatus === LOADSTATUSCODES.updated) &&
      redirectPath &&
      !isEmpty(redirectPath)
    ) {
      dispatch.navigation.navigate(redirectPath)
    }
  }, [dispatch.navigation, loadStatus, useRedirect, redirectPath, onChangeData])

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
      onMount={(queryFormValues, satisfiedByParentParams, setParameterValues) =>
        onMount(() => handleSubmit(queryFormValues, satisfiedByParentParams, setParameterValues))
      }
      parentSubmitting={parentSubmitting}
      setParentSubmitting={setParentSubmitting}
      getDefinitionDefaultValue={getDefinitionDefaultValue}
    />
  )
}

export default RemoteConfig
