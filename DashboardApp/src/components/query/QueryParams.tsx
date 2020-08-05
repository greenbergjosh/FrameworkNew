import React from "react"
import * as record from "fp-ts/lib/Record"
import { none, Option, some } from "fp-ts/lib/Option"
import { determineSatisfiedParameters } from "./lib/determineSatisfiedParameters"
import { JSONRecord } from "../../data/JSON"
import { useRematch } from "../../hooks"
import queryString, { ParsedQuery } from "query-string"
import { ParameterItem, QueryConfig } from "../../data/Report"
import { decodeGloballyPersistedParams } from "../../state/queries.persistedParams"

export interface PropsFromQueryParams {
  parameterValues: Option<JSONRecord>
  satisfiedByParentParams: JSONRecord
  setParameterValues: (value: React.SetStateAction<Option<JSONRecord>>) => void
  unsatisfiedByParentParams: ParameterItem[]
}

interface QueryParamsProps {
  children: (props: PropsFromQueryParams) => JSX.Element
  parentData?: JSONRecord
  queryConfig: QueryConfig
}

export const QueryParams = React.memo(({ children, parentData, queryConfig }: QueryParamsProps) => {
  /* ***************************
   *
   * Redux, State
   */

  const [fromStore /*dispatch*/] = useRematch((appState) => ({
    queryParamsByQuery: appState.queries.queryParamsByQuery,
    queryGlobalParams: appState.queries.queryGlobalParams,
  }))

  const [parameterValues, setParameterValues] = React.useState(none as Option<JSONRecord>)
  const [hasInitialParameters, setHasInitialParameters] = React.useState(false)

  /* ***************************
   *
   * Property Watchers
   */

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
    return decodeGloballyPersistedParams(gpp, queryConfig.parameters)
  }, [fromStore.queryGlobalParams, queryConfig.parameters])

  /**
   * Get persisted params by query
   */
  const persistedParams = React.useMemo(() => {
    return record.lookup(queryConfig.query, fromStore.queryParamsByQuery).toUndefined() as ParsedQuery
  }, [queryConfig.query, fromStore.queryParamsByQuery])

  /**
   * Combine param sources, and then sort them
   */
  const { satisfiedByParentParams, unsatisfiedByParentParams } = React.useMemo(() => {
    const sortedParameters = determineSatisfiedParameters(
      queryConfig.parameters,
      { ...persistedParams, ...globallyPersistedParams, ...querystringParams, ...parentData } || {},
      true
    )
    return sortedParameters
  }, [parentData, queryConfig.parameters, globallyPersistedParams, persistedParams, querystringParams])

  /**
   * Set QueryForm with initial parameters
   */
  React.useEffect(() => {
    if (!hasInitialParameters) {
      setParameterValues(some(satisfiedByParentParams))
      setHasInitialParameters(true)
    }
  }, [hasInitialParameters, satisfiedByParentParams])

  /* ***************************
   *
   * Render
   */

  return (
    <>
      {children({
        parameterValues,
        satisfiedByParentParams,
        setParameterValues,
        unsatisfiedByParentParams,
      })}
    </>
  )
})
