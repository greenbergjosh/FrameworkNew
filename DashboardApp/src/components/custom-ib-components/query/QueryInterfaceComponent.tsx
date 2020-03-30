import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import React from "react"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { QueryConfig } from "../../../data/Report"
import { Query} from "../../query/Query"
import { queryManageForm } from "./query-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderer,
  DataPathContext,
  UserInterfaceContext,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { QueryChildProps, QueryProps } from "../../query/types"

export interface IQueryInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "query"
  components: ComponentDefinition[]
  loadingKey?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  queryType: QueryProps["queryType"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

interface QueryInterfaceComponentDisplayModeProps extends IQueryInterfaceComponentProps {
  mode: "display"
}

interface QueryInterfaceComponentEditModeProps extends IQueryInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
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

type QueryInterfaceComponentProps = (
  | QueryRemoteQueryInterfaceComponentProps
  | QueryRemoteConfigInterfaceComponentProps
) &
  (QueryInterfaceComponentDisplayModeProps | QueryInterfaceComponentEditModeProps)

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
        hideLabel: true,
        components: [],
      },
    }
  }

  static manageForm = queryManageForm
  static contextType = UserInterfaceContext
  context!: React.ContextType<typeof UserInterfaceContext>

  render(): JSX.Element {
    const {
      components,
      loadingKey = "loading",
      mode,
      onChangeData,
      queryType,
      remoteDataFilter,
      userInterfaceData,
      valueKey,
    } = this.props

    const children = (result: QueryChildProps) => (
      <DataPathContext path="components">
        <ComponentRenderer
          components={components}
          data={{ ...userInterfaceData, [valueKey]: result.data, [loadingKey]: result.loading }}
          onChangeData={onChangeData}
          // onChangeSchema={(newSchema) => {
          //   if (this.props.mode === "edit") {
          //     this.props.onChangeSchema && this.props.onChangeSchema(newSchema)
          //   }
          // }}
          onChangeSchema={(newSchema) => {
            console.warn(
              "QueryInterfaceComponent.render",
              "TODO: Cannot alter schema inside ComponentRenderer in Query",
              { newSchema }
            )
          }}
        />
      </DataPathContext>
    )

    return this.props.queryType === "remote-config" ? (
      <Query
        dataKey={valueKey}
        inputData={userInterfaceData}
        paused={mode === "edit"}
        queryType={this.props.queryType}
        remoteConfigType={this.props.remoteConfigType}
        remoteDataFilter={remoteDataFilter}>
        {children}
      </Query>
    ) : (
      <Query
        dataKey={valueKey}
        inputData={userInterfaceData}
        paused={mode === "edit"}
        queryType={this.props.queryType}
        remoteQuery={this.props.remoteQuery}>
        {children}
      </Query>
    )
  }
}
