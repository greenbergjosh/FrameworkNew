import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { QueryConfig } from "../../../../api/ReportCodecs"
import { JSONRecord } from "../../../../lib/JSONRecord"
import { getQueryConfig, getQueryFormValues } from "../utils"
import { QueryForm } from "../../../_shared/query/QueryForm"
import {
  LoadStatus,
  LoadStatusCode,
  LOADSTATUSCODES,
  OnSubmitType,
  RemoteConfigFromStore,
  RemoteConfigProps,
} from "../../types"
import { QueryParams } from "../../../_shared/query/QueryParams"
import { executeRemoteConfig } from "./executeRemoteConfig"
import { useRematch } from "../../../../hooks"
import { store } from "../../../../state/store"
import { AppDispatch } from "../../../../state/store.types"
import { isEmpty, merge } from "lodash/fp"
import { PersistedConfig } from "../../../../api/GlobalConfigCodecs"
import { NotifyConfig } from "../../../../state/feedback"

function RemoteConfig(props: RemoteConfigProps): JSX.Element {
  const {
    actionType,
    buttonLabel,
    buttonProps,
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

  /* Originally from ReportBody.tsx */
  const handleSubmit: OnSubmitType = (parameterValues, satisfiedByParentParams, setParameterValues) => {
    if (!queryConfig || mode === "edit") return
    onRaiseEvent(LOADSTATUSCODES.loading, { value: {} })

    /*
     * From ReportBody.tsx
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
    <QueryParams queryConfig={queryConfig} parentData={params}>
      {({ parameterValues, satisfiedByParentParams, setParameterValues, unsatisfiedByParentParams }) => (
        <QueryForm
          getRootUserInterfaceData={getRootUserInterfaceData}
          onChangeRootData={onChangeRootData}
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
          getDefinitionDefaultValue={getDefinitionDefaultValue}
        />
      )}
    </QueryParams>
  )
}

export default RemoteConfig
