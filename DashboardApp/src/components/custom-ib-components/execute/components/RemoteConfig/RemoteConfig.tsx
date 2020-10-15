import { Empty } from "antd"
import { some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { QueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { getQueryConfig, mergeResultDataWithModel } from "../utils"
import { QueryForm } from "../../../../query/QueryForm"
import { FromStore, LoadStatusCode, OnSubmitType, RemoteConfigProps } from "../../types"
import { QueryParams } from "../../../../query/QueryParams"
import { executeRemoteConfig } from "./executeRemoteConfig"
import { useRematch } from "../../../../../hooks"
import { store } from "../../../../../state/store"
import { AppDispatch } from "../../../../../state/store.types"
import { get, isEmpty } from "lodash/fp"

function RemoteConfig(props: RemoteConfigProps): JSX.Element {
  const {
    actionType,
    buttonLabel,
    buttonProps,
    configNameKey,
    context,
    deleteRedirectPath,
    entityTypeId,
    onChangeData,
    onMount,
    outboundValueKey,
    parentSubmitting,
    queryConfigId,
    remoteConfigIdKey,
    remoteConfigStaticId,
    resultsType,
    setParentSubmitting,
    useDeleteRedirect,
    userInterfaceData,
    valueKey,
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

  const [fromStore, dispatch]: [FromStore, AppDispatch] = useRematch((appState) => ({
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
   * Put the query config from Persisted Global Configs into state
   */
  const queryConfig: QueryConfig | undefined = React.useMemo(() => {
    return getQueryConfig(context, queryConfigId)
  }, [queryConfigId, context])

  /* *************************************
   *
   * EVENT HANDLERS
   */

  /* Originally from ReportBody.tsx */
  const handleSubmit: OnSubmitType = (parameterValues, satisfiedByParentParams, setParameterValues) => {
    if (!queryConfig) return

    // Send parameterValues state back up to <QueryParams>
    setParameterValues(some(parameterValues))
    const queryFormValues: JSONRecord = { ...satisfiedByParentParams, ...parameterValues }

    const uiDataSlice: JSONRecord = !isEmpty(outboundValueKey)
      ? get(outboundValueKey, userInterfaceData)
      : userInterfaceData

    return executeRemoteConfig({
      actionType,
      configNameKey,
      dispatch,
      entityTypeId,
      fromStore,
      queryConfig,
      queryFormValues,
      remoteConfigStaticId,
      remoteConfigIdKey,
      resultsType,
      uiDataSlice,
      userInterfaceData,
      valueKey,
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
          outboundValueKey,
          parameterValues,
          queryConfigQuery: queryConfig.query,
          resultData: newLoadingState.data,
          userInterfaceData,
        })
        onChangeData(newData)
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
  }, [dispatch.navigation, loadStatus, useDeleteRedirect, deleteRedirectPath])

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

export default RemoteConfig
