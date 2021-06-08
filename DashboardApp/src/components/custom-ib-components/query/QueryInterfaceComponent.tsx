import React from "react"
import { Query } from "../../query/Query"
import { QueryChildProps } from "../../query/types"
import { queryManageForm } from "./query-manage-form"
import {
  BaseInterfaceComponent,
  ComponentRenderer,
  DataPathContext,
  getMergedData,
  UserInterfaceContext,
  UserInterfaceProps,
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

  private getQueryResultUIData(result: QueryChildProps<any>): UserInterfaceProps["data"] {
    const { userInterfaceData, valueKey, loadingKey = "loading" } = this.props
    return getMergedData(
      [
        [valueKey, result.data],
        [loadingKey, result.loading],
      ],
      userInterfaceData,
      this.props.getRootUserInterfaceData
    )
  }

  render(): JSX.Element {
    const {
      components,
      mode,
      onChangeData,
      remoteDataFilter,
      userInterfaceData,
      getRootUserInterfaceData,
      onChangeRootData,
      valueKey,
    } = this.props

    const children = (result: QueryChildProps) => (
      <DataPathContext path="components">
        <ComponentRenderer
          components={components}
          data={this.getQueryResultUIData(result)}
          getRootUserInterfaceData={getRootUserInterfaceData}
          onChangeRootData={onChangeRootData}
          onChangeData={onChangeData}
          onChangeSchema={(newSchema) => {
            // if (this.props.mode === "edit") {
            //   this.props.onChangeSchema && this.props.onChangeSchema(newSchema)
            // }
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
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
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
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
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
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
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
