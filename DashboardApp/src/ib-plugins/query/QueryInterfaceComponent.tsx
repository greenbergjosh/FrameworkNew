import React from "react"
import { Query } from "../../components/query/Query"
import { QueryChildProps } from "../../components/query/types"
import { settings } from "./settings"
import {
  BaseInterfaceComponent,
  ComponentRenderer,
  DataPathContext,
  getMergedData,
  UserInterfaceContext,
  UserInterfaceContextManager,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { QueryInterfaceComponentProps, QueryInterfaceComponentState } from "./types"
import layoutDefinition from "./layoutDefinition"

export default class QueryInterfaceComponent extends BaseInterfaceComponent<
  QueryInterfaceComponentProps,
  QueryInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return layoutDefinition
  }

  static manageForm = settings
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
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
            remoteQuery={this.props.remoteQuery}
            getDefinitionDefaultValue={QueryInterfaceComponent.getDefinitionDefaultValue}>
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
            remoteUrl={this.props.remoteUrl}
            getDefinitionDefaultValue={QueryInterfaceComponent.getDefinitionDefaultValue}>
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
            remoteDataFilter={remoteDataFilter}
            getDefinitionDefaultValue={QueryInterfaceComponent.getDefinitionDefaultValue}>
            {children}
          </Query>
        )
    }
  }
}
