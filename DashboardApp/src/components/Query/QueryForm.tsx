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
  ({
    layout,
    parameters,
    parameterValues,
    onMount,
    onSubmit,
    parentSubmitting,
    setParentSubmitting,
    submitButtonLabel,
    submitButtonProps,
  }: QueryFormProps) => {
    /* ****************************
     *
     * State
     */

    const [formState, updateFormState] = React.useState({})
    const [loading, setLoading] = React.useState(false)
    const [submitting, setSubmitting] = React.useState(false)

    const [fromStore /* dispatch */] = useRematch((appState) => {
      const privilegedUserInterfaceContextManager = getPrivilegedUserInterfaceContextManager(appState)

      return {
        configs: appState.globalConfig.configs,
        configsById: store.select.globalConfig.configsById(appState),
        configNames: store.select.globalConfig.configNames(appState),
        configsByType: store.select.globalConfig.configsByType(appState),
        defaultEntityTypeConfig: appState.globalConfig.defaultEntityTypeConfig,
        entityTypes: store.select.globalConfig.entityTypeConfigs(appState),
        isUpdatingRemoteConfig: appState.loading.effects.globalConfig.updateRemoteConfig,
        isDeletingRemoteConfig: appState.loading.effects.globalConfig.deleteRemoteConfigs,
        reportDataByQuery: appState.reports.reportDataByQuery,
        privilegedUserInterfaceContextManager,
      }
    })

    /* ****************************
     *
     * Property Watchers
     */

    /*
     * Trigger onMount event only on component mount.
     * For instance the parent may want to execute this
     * query form immediately when the page loads.
     */
    React.useEffect(() => {
      if (!onMount) return
      const newState = getDefaultFormValues(layout, parameters, parameterValues)
      const promise = onMount(newState)

      updateFormState(newState)
      if (promise) {
        setLoading(true)
        promise.finally(() => {
          setLoading(false)
        })
      }
      setSubmitting(false)
    }, [])

    /*
     * Update form state when layout or parameters change
     */
    React.useEffect(() => {
      const newState = getDefaultFormValues(layout, parameters, parameterValues)

      updateFormState(newState)
    }, [layout, parameters, parameterValues])

    /*
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
      setParentSubmitting && setParentSubmitting(false)
    }, [submitting, onSubmit, setParentSubmitting, formState])

    /*
     * Parent Submit Form
     * Allow parent components to trigger a submit
     */
    React.useEffect(() => {
      if (parentSubmitting) {
        setSubmitting(true)
      }
    }, [parentSubmitting, setSubmitting])

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
 * Static Functions
 */

export function getDefaultFormValues(
  layout: QueryFormProps["layout"],
  parameters: QueryFormProps["parameters"],
  parameterValues: JSONRecord
) {
  const defaultComponentValues = getDefaultComponentValues(layout)
  const defaultParameters = getDefaultParameters(parameters)

  return merge(merge(defaultParameters, defaultComponentValues), parameterValues)
}

/**
 *
 * @param parameters
 */
export function getDefaultParameters(parameters: QueryConfig["parameters"]): JSONRecord {
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
export function getDefaultComponentValues(layout: QueryConfig["layout"]): JSONRecord {
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
