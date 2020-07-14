import * as record from "fp-ts/lib/Record"
import debounce from "lodash.debounce"
import { merge } from "lodash/fp"
import React from "react"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { JSONRecord } from "../../../data/JSON"
import { ParameterItem, QueryConfig } from "../../../data/Report"
import { useRematch } from "../../../hooks"
import { store } from "../../../state/store"
import {
  ComponentDefinition,
  getDefaultsFromComponentDefinitions,
  UserInterface,
  UserInterfaceContextManager,
} from "@opg/interface-builder"
import { buttonProps } from "../../custom-ib-components/execute/types"
import { SubmitButton } from "./SubmitButton"
import { AdminUserInterfaceContextManager } from "../../../data/AdminUserInterfaceContextManager.type"

interface QueryFormProps {
  layout: QueryConfig["layout"]
  parameters: QueryConfig["parameters"]
  parameterValues: JSONRecord
  onSubmit: (parameterValues: JSONRecord) => void | Promise<unknown>
  submitButtonProps?: buttonProps
  submitButtonLabel?: string // retained for legacy
}

export const QueryForm = React.memo(
  ({ layout, parameters, parameterValues, onSubmit, submitButtonLabel, submitButtonProps }: QueryFormProps) => {
    /* ***************************************************
     *
     * State, and Redux <--> Context connector
     */

    /**
     * Redux to Context connector
     */
    const [fromStore, dispatch] = useRematch((s) => {
      const executeQuery = store.dispatch.reports.executeQuery.bind(store.dispatch.reports)
      const userInterfaceContextManager: Partial<AdminUserInterfaceContextManager> &
        UserInterfaceContextManager<PersistedConfig> = {
        executeQuery,
        reportDataByQuery: s.reports.reportDataByQuery,
        loadByFilter: (predicate: (item: PersistedConfig) => boolean): PersistedConfig[] => {
          return s.globalConfig.configs.map((cfgs) => cfgs.filter(predicate)).toNullable() || []
        },
        loadById: (id: string) => {
          return record.lookup(id, store.select.globalConfig.configsById(s)).toNullable()
        },
        loadByURL: (url: string) => {
          return [] // TODO: axios
        },
      }

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
        userInterfaceContextManager,
      }
    })

    const [formState, updateFormState] = React.useState({})
    const [loading, setLoading] = React.useState(false)
    const [submitting, setSubmitting] = React.useState(false)

    /* ***************************************************
     *
     * Property Watchers
     */

    /**
     * Update State
     */
    React.useEffect(() => {
      const emptyComponentValues: JSONRecord = {}
      const emptyParameters: { [key: string]: any } = {}
      const layoutOrEmptySet = (layout || []) as ComponentDefinition[]
      const defaultComponentValues = layoutOrEmptySet.reduce((acc, layoutItem: ComponentDefinition) => {
        const defaults = getDefaultsFromComponentDefinitions([layoutItem])
        return merge(acc, defaults)
      }, emptyComponentValues)
      const defaultParameters =
        parameters &&
        parameters.reduce((acc: { [key: string]: any }, parameter: ParameterItem) => {
          if (parameter.defaultValue.isSome()) {
            acc[parameter.name] = parameter.defaultValue.toUndefined()
          }
          return acc
        }, emptyParameters)
      const newState = merge(merge(defaultParameters, defaultComponentValues), parameterValues)

      updateFormState(newState)
    }, [layout, parameters, parameterValues])

    /**
     * Submit Form
     * Wait until state has been updated to submit the form. Otherwise, we submit old data.
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

    /* ***************************************************
     *
     * Event Handlers
     */

    /**
     * Wait until state has been updated to submit the form. Otherwise, we submit old data.
     */
    const handleSubmit = React.useCallback(
      () =>
        debounce(() => {
          setSubmitting(true)
        }, 50)(),
      []
    )

    /* ***************************************************
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
            contextManager={fromStore.userInterfaceContextManager}
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
