import React from "react"
import * as record from "fp-ts/lib/Record"
import { none, Option, some } from "fp-ts/lib/Option"
import { determineSatisfiedParameters } from "./determineSatisfiedParameters"
import { JSONRecord } from "../../../../lib/JSONRecord"
import { useRematch } from "../../../../hooks"
import queryString, { ParsedQuery } from "query-string"
import { decodeGloballyPersistedParams } from "../../../../state/queries/persistedParams"
import {
  AbstractBaseInterfaceComponentType,
  ComponentDefinition,
  getDefaultsFromComponentDefinitions,
} from "@opg/interface-builder"
import { merge } from "lodash/fp"
import { ParameterItem, QueryConfig } from "../../../../api/ReportCodecs"
import { AppState } from "../../../../state/store.types"
import { store } from "../../../../state/store"
import { PersistedConfig } from "../../../../api/GlobalConfigCodecs"
import { PrivilegedUserInterfaceContextManager, QueryParamsProps } from "../../types"

export const QueryParams = React.memo((props: QueryParamsProps) => {
  const [fromStore /* dispatch */] = useRematch((appState) => {
    const privilegedUserInterfaceContextManager = getPrivilegedUserInterfaceContextManager(appState)

    return {
      privilegedUserInterfaceContextManager,
      queryParamsByQuery: appState.queries.queryParamsByQuery,
      queryGlobalParams: appState.queries.queryGlobalParams,
    }
  })
  const isMountedRef = React.useRef(true)
  const [parameterValues, setParameterValues] = React.useState(none as Option<JSONRecord>)
  const [hasInitialParameters, setHasInitialParameters] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [formState, setFormState] = React.useState({})

  /* ***************************
   *
   * Property Watchers
   */

  /*
   * PREVENT MEMORY LEAKS
   *
   * We can't use the usual way of checking mounted status by setting
   * an isMounted variable in the useEffect and then checking its value
   * before setting state.
   *
   * Since a submit can be kicked off outside of useEffect, we use a ref
   * and this "unmount" useEffect to track the mounted status.
   * Other useEffects in this component must check the isMounted.current ref
   * before setting state.
   *
   * We can't use the traditional way of
   * https://stackoverflow.com/questions/58038008/how-to-stop-memory-leak-in-useeffect-hook-react
   */
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Get querystring params
   */
  const querystringParams = React.useMemo(() => {
    return queryString.parse(window.location.search, {
      parseBooleans: true,
      parseNumbers: true,
      arrayFormat: "comma",
    })
  }, [])

  /**
   * Get persisted global params
   * Filter globally persisted params that aren't globally persisted by this query
   */
  const globallyPersistedParams = React.useMemo(() => {
    const gpp = fromStore.queryGlobalParams
    return decodeGloballyPersistedParams(gpp, props.queryConfig.parameters)
  }, [fromStore.queryGlobalParams, props.queryConfig.parameters])

  /**
   * Get persisted params by query
   */
  const persistedParams = React.useMemo(() => {
    return record.lookup(props.queryConfig.query, fromStore.queryParamsByQuery).toUndefined() as ParsedQuery
  }, [props.queryConfig.query, fromStore.queryParamsByQuery])

  /**
   * Combine param sources, and then sort them
   */
  const { satisfiedByParentParams, unsatisfiedByParentParams } = React.useMemo(() => {
    const sortedParameters = determineSatisfiedParameters(
      props.queryConfig.parameters,
      { ...persistedParams, ...globallyPersistedParams, ...querystringParams, ...props.parentData } || {},
      true
    )
    return sortedParameters
  }, [props.parentData, props.queryConfig.parameters, globallyPersistedParams, persistedParams, querystringParams])

  /**
   * Set QueryForm with initial parameters
   */
  React.useEffect(() => {
    if (!hasInitialParameters) {
      setParameterValues(some(satisfiedByParentParams))
      setHasInitialParameters(true)
    }
  }, [hasInitialParameters, satisfiedByParentParams])

  /*
   * Trigger onMount event only on component mount.
   * For instance the parent may want to execute this
   * query form immediately when the page loads.
   */
  React.useEffect(() => {
    if (!props.onMount) return
    const newState = getDefaultFormValues(
      props.layout,
      unsatisfiedByParentParams,
      parameterValues.getOrElse(record.empty),
      props.getDefinitionDefaultValue
    )
    props.onMount(newState, satisfiedByParentParams, setParameterValues)
    setFormState(newState)
    setSubmitting(false)
  }, [])

  /*
   * Update form state when layout or parameters change
   */
  React.useEffect(() => {
    const newState = getDefaultFormValues(
      props.layout,
      unsatisfiedByParentParams,
      parameterValues.getOrElse(record.empty),
      props.getDefinitionDefaultValue
    )

    setFormState(newState)
  }, [props.layout, unsatisfiedByParentParams, parameterValues, props.getDefinitionDefaultValue])

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
    props.onSubmit(formState, satisfiedByParentParams, setParameterValues)
    setSubmitting(false)
    props.setParentSubmitting && props.setParentSubmitting(false)
  }, [submitting, props.onSubmit, props.setParentSubmitting, formState])

  /*
   * Parent Submit Form
   * Allow parent components to trigger a submit
   */
  React.useEffect(() => {
    if (props.parentSubmitting) {
      setSubmitting(true)
    }
  }, [props.parentSubmitting, setSubmitting])

  /* ***************************
   *
   * Render
   */

  return null
})

/* ************************************************************************************
 *
 * Static Functions
 */

export function getDefaultFormValues(
  layout: QueryConfig["layout"],
  parameters: QueryConfig["parameters"],
  parameterValues: JSONRecord,
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
): JSONRecord {
  const defaultComponentValues = getDefaultComponentValues(layout, getDefinitionDefaultValue)
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
export function getDefaultComponentValues(
  layout: QueryConfig["layout"],
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
): JSONRecord {
  const emptyComponentValues: JSONRecord = {}
  const layoutOrEmptySet = (layout || []) as ComponentDefinition[]

  return layoutOrEmptySet.reduce((acc, layoutItem: ComponentDefinition) => {
    return merge(acc, getDefaultsFromComponentDefinitions([layoutItem], getDefinitionDefaultValue))
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
