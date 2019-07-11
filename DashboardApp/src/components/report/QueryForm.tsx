import { Button } from "antd"
import * as record from "fp-ts/lib/Record"
import debounce from "lodash.debounce"
import { merge } from "lodash/fp"
import React from "react"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { JSONRecord } from "../../data/JSON"
import { ParameterItem, QueryConfig } from "../../data/Report"
import { useRematch } from "../../hooks"
import { generateLayoutFromParameters } from "../../routes/dashboard/routes/reports/routes/report/generators"
import { store } from "../../state/store"
import { registry } from "../interface-builder/registry"
import { UserInterface } from "../interface-builder/UserInterface"
import { UserInterfaceContextManager } from "../interface-builder/UserInterfaceContextManager"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  getDefaultsFromComponentDefinitions,
} from "../interface-builder/components/base/BaseInterfaceComponent"

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
    reportDataByQuery: s.reports.reportDataByQuery,
    userInterfaceContextManager: {
      executeQuery: store.dispatch.reports.executeQuery.bind(store.dispatch.reports),
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
    } as UserInterfaceContextManager,
  }))

  const defaultFormState = React.useMemo(() => {
    const defaultComponentValues = ((layout || []) as ComponentDefinition[]).reduce(
      (acc, layoutItem: ComponentDefinition) => {
        // const Component = registry.lookup(layoutItem.component)
        // if (Component) {
        return merge(acc, getDefaultsFromComponentDefinitions([layoutItem]))
        // }
        // return acc
      },
      {} as JSONRecord
    )
    const defaultParameters = parameters.reduce(
      (acc: { [key: string]: any }, parameter: ParameterItem) => {
        if (parameter.defaultValue.isSome()) {
          acc[parameter.name] = parameter.defaultValue.toUndefined()
        }
        return acc
      },
      {} as { [key: string]: any }
    )

    return merge(defaultParameters, defaultComponentValues)
  }, [])

  const [formState, updateFormState] = React.useState(defaultFormState)

  const handleSubmit = React.useCallback(
    debounce(() => {
      console.log("handleSubmit", formState)
      onSubmit(formState)
    }, 50),
    [onSubmit, formState]
  )

  if (layout) {
    console.log("QueryForm.render", { layout })

    return (
      <>
        <UserInterface
          mode="display"
          components={(layout as unknown) as ComponentDefinition[]}
          data={formState}
          onChangeData={updateFormState}
          contextManager={fromStore.userInterfaceContextManager}
        />
        <div style={{ marginTop: "10px" }}>
          <Button onClick={handleSubmit}>Generate Report</Button>
        </div>
      </>
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
