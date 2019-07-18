import { Alert, Collapse, Spin } from "antd"
import { tryCatch } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { reporter } from "io-ts-reporters"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import jsonLogic from "json-logic-js"
import JSON5 from "json5"
import { get, set } from "lodash/fp"
import React from "react"
import { Right } from "../../../../../data/Either"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { QueryConfig, QueryConfigCodec } from "../../../../../data/Report"
import { determineSatisfiedParameters } from "../../../../../lib/determine-satisfied-parameters"
import { cheapHash } from "../../../../../lib/json"
import { Query, QueryChildProps, QueryProps } from "../../../../query/Query"
import { QueryForm } from "../../../../report/QueryForm"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { UserInterfaceContext } from "../../../UserInterfaceContextManager"
import { queryManageForm } from "./query-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface IQueryInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "query"
  onChangeData: UserInterfaceProps["onChangeData"]
  queryType: QueryProps["queryType"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

interface QueryRemoteQueryInterfaceComponentProps extends IQueryInterfaceComponentProps {
  queryType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
  // remoteQueryMapping?: [{ label: "label"; value: string }, { label: "value"; value: string }]
}
interface QueryRemoteConfigInterfaceComponentProps extends IQueryInterfaceComponentProps {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

type QueryInterfaceComponentProps =
  | QueryRemoteQueryInterfaceComponentProps
  | QueryRemoteConfigInterfaceComponentProps

interface QueryInterfaceComponentState {
  data: any[]
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  parameterValues: { [key: string]: any }
  promptLayout: QueryConfig["layout"]
  promptParameters: QueryConfig["parameters"]
}

export class QueryInterfaceComponent extends BaseInterfaceComponent<
  QueryInterfaceComponentProps,
  QueryInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "query",
      title: "Query",
      icon: "database",
      componentDefinition: {
        component: "query",
        label: "Query",
      },
    }
  }

  static manageForm = queryManageForm
  static contextType = UserInterfaceContext
  context!: React.ContextType<typeof UserInterfaceContext>

  render(): JSX.Element {
    const { queryType, remoteDataFilter, userInterfaceData, valueKey } = this.props

    const children = (result: QueryChildProps) => <Alert type="warning" message="Test" />

    return this.props.queryType === "remote-config" ? (
      <Query
        dataKey={valueKey}
        inputData={userInterfaceData}
        queryType={this.props.queryType}
        remoteConfigType={this.props.remoteConfigType}
        remoteDataFilter={remoteDataFilter}>
        {children}
      </Query>
    ) : (
      <Query
        dataKey={valueKey}
        inputData={userInterfaceData}
        queryType={this.props.queryType}
        remoteQuery={this.props.remoteQuery}>
        {children}
      </Query>
    )
  }
}
