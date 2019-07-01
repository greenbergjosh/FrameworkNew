import { Button } from "antd"
import * as record from "fp-ts/lib/Record"
import debounce from "lodash.debounce"
import React from "react"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { JSONRecord } from "../../data/JSON"
import { QueryConfig } from "../../data/Report"
import { useRematch } from "../../hooks"
import { generateLayoutFromParameters } from "../../routes/dashboard/routes/reports/routes/report/generators"
import { store } from "../../state/store"
import { ComponentDefinition } from "../interface-builder/components/base/BaseInterfaceComponent"
import { UserInterface } from "../interface-builder/UserInterface"
import { UserInterfaceContextManager } from "../interface-builder/UserInterfaceContextManager"

interface Props {
  layout: QueryConfig["layout"]
  parameters: QueryConfig["parameters"]
  parameterValues: JSONRecord
  onSubmit: (parameterValues: JSONRecord) => void
}

// TODO: Improve this type
export interface FormState {
  data: JSONRecord
  metadata: {
    browserName: string
    offset: number
    onLine: boolean
    pathName: string
    referrer: string
    timezone: string
    userAgent: string
  }
}

const generatedSubmitButton = {
  type: "button",
  label: "Generate Report",
  // key: "submit",
  disableOnInvalid: true,
  theme: "primary",
  input: true,
  tableView: true,
}

const generateFormFromLayout = (layout: QueryConfig["layout"]) => ({
  component: "form",
  components: layout,
})

export const QueryForm = React.memo(({ layout, parameters, parameterValues, onSubmit }: Props) => {
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsById: store.select.globalConfig.configsById(s),
    configNames: store.select.globalConfig.configNames(s),
    configsByType: store.select.globalConfig.configsByType(s),
    defaultEntityTypeConfig: s.globalConfig.defaultEntityTypeConfig,
    entityTypes: store.select.globalConfig.entityTypeConfigs(s),
    isUpdatingRemoteConfig: s.loading.effects.globalConfig.updateRemoteConfig,
    isDeletingRemoteConfig: s.loading.effects.globalConfig.deleteRemoteConfigsById,
  }))

  const userInterfaceContextManager: UserInterfaceContextManager = {
    executeQuery: dispatch.reports.executeQuery.bind(dispatch.reports),
    loadByFilter: (predicate: (item: PersistedConfig) => boolean): PersistedConfig[] => {
      return fromStore.configs.map((cfgs) => cfgs.filter(predicate)).toNullable() || []
    },
    loadById: (id: string) => {
      return record.lookup(id, fromStore.configsById).toNullable()
    },
    loadByURL: (url: string) => {
      return [] // axios
    },
  }

  const [formState, updateFormState] = React.useState({})

  const handleSubmit = React.useCallback(
    debounce(() => {
      console.log("handleSubmit", formState)
      onSubmit(formState)
    }, 50),
    [onSubmit, formState]
  )

  const realLayout = layout.length
    ? layout
    : parameters.length
    ? generateLayoutFromParameters(parameters)
    : null

  //: {[key: string]: string | boolean | number}
  if (realLayout) {
    const defaultParameters = parameters.reduce(
      (acc, parameter) => {
        if (parameter.defaultValue.isSome()) {
          acc[parameter.name] = parameter.defaultValue.toUndefined()
        }

        return acc
      },
      {} as any
    )

    console.log("QueryForm.render", { layout })

    return (
      <>
        <UserInterface
          mode="display"
          components={(layout as unknown) as ComponentDefinition[]}
          data={formState}
          onChangeData={updateFormState}
          contextManager={userInterfaceContextManager}
        />
        <div style={{ marginTop: "10px" }}>
          <Button onClick={handleSubmit}>Generate Report</Button>
        </div>
      </>
      // <Form
      //   form={generateFormFromLayout(realLayout)}
      //   submission={{ data: { ...defaultParameters, ...parameterValues } }}
      //   onSubmit={handleSubmit}
      //   options={{ reactContext: { test: "Hello" } }}
      // />
    )
  }

  return null
})

function recursiveIndexBy(
  items: JSONRecord[],
  keyFn: (item: JSONRecord) => string,
  recursiveKeys: string[],
  result: JSONRecord = {}
) {}
