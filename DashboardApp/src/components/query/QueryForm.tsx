import debounce from "lodash.debounce"
import { merge } from "lodash/fp"
import React from "react"
import { JSONRecord } from "../../data/JSON"
import { ParameterItem, QueryConfig } from "../../data/Report"
import { useRematch } from "../../hooks"
import { store } from "../../state/store"
import { ComponentDefinition, getDefaultsFromComponentDefinitions, UserInterface } from "@opg/interface-builder"
import { SubmitButton } from "./components/SubmitButton"
import { PrivilegedUserInterfaceContextManager, QueryFormProps } from "./types"
import { AppState } from "../../state/store.types"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import * as record from "fp-ts/lib/Record"

export const QueryForm = React.memo(
  ({ layout, parameters, parameterValues, onSubmit, submitButtonLabel, submitButtonProps }: QueryFormProps) => {
    /* ****************************
     *
     * State
     */

    const [formState, updateFormState] = React.useState({})
    const [loading, setLoading] = React.useState(false)
    const [submitting, setSubmitting] = React.useState(false)

    const [fromStore, dispatch] = useRematch((s: AppState) => {
      const privilegedUserInterfaceContextManager = getPrivilegedUserInterfaceContextManager(s)

      return {
        configs: s.globalConfig.configs,
        configsById: store.select.globalConfig.configsById(s),
        configNames: store.select.globalConfig.configNames(s),
        configsByType: store.select.globalConfig.configsByType(s),
        defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
        entityTypes: store.select.globalConfig.entityTypeConfigs(s),
        isUpdatingRemoteConfig: s.loading.effects.globalConfig.updateRemoteConfig,
        isDeletingRemoteConfig: s.loading.effects.globalConfig.deleteRemoteConfigs,
        reportDataByQuery: s.reports.reportDataByQuery,
        privilegedUserInterfaceContextManager,
      }
    })

    /* ****************************
     *
     * Property Watchers
     */

    /**
     * Update form state when layout or parameters change
     */
    React.useEffect(() => {
      const defaultComponentValues = getDefaultComponentValues(layout)
      const defaultParameters = getDefaultParameters(parameters)
      const newState = merge(merge(defaultParameters, defaultComponentValues), parameterValues)

      updateFormState(newState)
    }, [layout, parameters, parameterValues])

    /**
     * Submit Form
     * Wait until state is updated to submit the form so we don't submit old data.
     */
    React.useEffect(() => {
      // This effect triggers whenever state updates,
      // so we check first for submitting.
      if (!submitting) {
        return
      }
      const promise = onSubmit(formState)
      if (promise) {
        setLoading(true)
        promise.finally(() => {
          setLoading(false)
        })
      }
      setSubmitting(false)
    }, [submitting, onSubmit, formState])

    /* ****************************
     *
     * Event Handlers
     */

    /**
     * Submit Form
     * We only set the "submitting" state so that the state watcher will handle the api call.
     * This is because React state is not guaranteed to update immediately,
     * so we wait until state is updated so we don't submit old data.
     */
    const handleSubmit = React.useCallback(
      () =>
        debounce(() => {
          setSubmitting(true)
        }, 50)(),
      []
    )

    /* ****************************
     *
     * Render
     */

    if (layout) {
      return (
        <>
          <UserInterface
            mode="display"
            components={(layout as unknown) as ComponentDefinition[]}
            data={formState}
            onChangeData={updateFormState}
            contextManager={fromStore.privilegedUserInterfaceContextManager}
            submit={handleSubmit}
          />
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <SubmitButton
              onSubmit={handleSubmit}
              loading={loading}
              submitButtonLabel={submitButtonLabel}
              submitButtonProps={submitButtonProps}
            />
          </div>
        </>
      )
    }

    return null
  }
)

/* ************************************************************************************
 *
 * Private Functions
 */

/**
 *
 * @param parameters
 */
function getDefaultParameters(parameters: QueryConfig["parameters"]): JSONRecord {
  const emptyParameters: { [key: string]: any } = {}

  return (
    parameters &&
    parameters.reduce((acc: { [key: string]: any }, parameter: ParameterItem) => {
      if (parameter.defaultValue.isSome()) {
        acc[parameter.name] = parameter.defaultValue.toUndefined()
      }
      return acc
    }, emptyParameters)
  )
}

/**
 *
 * @param layout
 */
function getDefaultComponentValues(layout: QueryConfig["layout"]): JSONRecord {
  const emptyComponentValues: JSONRecord = {}
  const layoutOrEmptySet = (layout || []) as ComponentDefinition[]

  return layoutOrEmptySet.reduce((acc, layoutItem: ComponentDefinition) => {
    return merge(acc, getDefaultsFromComponentDefinitions([layoutItem]))
  }, emptyComponentValues)
}

/**
 * Connects Redux to Context
 * @param appState
 */
export function getPrivilegedUserInterfaceContextManager(appState: AppState): PrivilegedUserInterfaceContextManager {
  return {
    executeQuery: store.dispatch.reports.executeQuery.bind(store.dispatch.reports),
    reportDataByQuery: appState.reports.reportDataByQuery,
    loadByFilter: (predicate: (item: PersistedConfig) => boolean): PersistedConfig[] => {
      return appState.globalConfig.configs.map((cfgs) => cfgs.filter(predicate)).toNullable() || []
    },
    loadById: (id: string) => {
      return record.lookup(id, store.select.globalConfig.configsById(appState)).toNullable()
    },
    loadByURL: (url: string) => {
      return [] // TODO: axios
    },
  }
}
