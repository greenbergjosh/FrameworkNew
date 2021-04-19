import React from "react"
import { Query } from "../../query/Query"
import { QueryChildProps } from "../../query/types"
import { queryManageForm } from "./query-manage-form"
import {
  BaseInterfaceComponent,
  ComponentRenderer,
  DataPathContext,
  UserInterfaceContext,
} from "@opg/interface-builder"
import { QueryInterfaceComponentProps, QueryInterfaceComponentState } from "./types"

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
      getRootUserInterfaceData,
      valueKey,
    } = this.props

    const children = (result: QueryChildProps) => (
      <DataPathContext path="components">
        <ComponentRenderer
          components={components}
          data={{ ...userInterfaceData, [valueKey]: result.data, [loadingKey]: result.loading }}
          getRootData={getRootUserInterfaceData}
          onChangeData={onChangeData}
          // onChangeSchema={(newSchema: any) => {
          //   if (this.props.mode === "edit") {
          //     this.props.onChangeSchema && this.props.onChangeSchema(newSchema)
          //   }
          // }}
          onChangeSchema={(newSchema: any) => {
            console.warn(
              "QueryInterfaceComponent.render",
              "TODO: Cannot alter schema inside ComponentRenderer in Query",
              { newSchema }
            )
          }}
        />
      </DataPathContext>
    )

    switch (this.props.queryType) {
      case "remote-query":
        return (
          <Query
            dataKey={valueKey}
            inputData={userInterfaceData}
            paused={mode === "edit"}
            queryType={this.props.queryType}
            remoteQuery={this.props.remoteQuery}>
            {children}
          </Query>
        )
      case "remote-url":
        return (
          <Query
            dataKey={valueKey}
            inputData={userInterfaceData}
            paused={mode === "edit"}
            queryType={this.props.queryType}
            remoteUrl={this.props.remoteUrl}>
            {children}
          </Query>
        )
      case "remote-config":
        return (
          <Query
            dataKey={valueKey}
            inputData={userInterfaceData}
            paused={mode === "edit"}
            queryType={this.props.queryType}
            remoteConfigType={this.props.remoteConfigType}
            remoteDataFilter={remoteDataFilter}>
            {children}
          </Query>
        )
    }
  }
}
