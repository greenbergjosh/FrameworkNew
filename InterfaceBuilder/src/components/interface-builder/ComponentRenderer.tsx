import { isEmpty, set } from "lodash/fp"
import { forIn } from "lodash"
import React from "react"
import { deepDiff } from "./lib/deep-diff"
import { DataPathContext } from "./util/DataPathContext"
import { ComponentDefinition } from "./components/base/BaseInterfaceComponent"
import { Droppable, DroppableContextType, shallowPropCheck } from "./dnd"
import { registry } from "./registry"
import { RenderInterfaceComponent, RenderInterfaceComponentProps } from "./RenderInterfaceComponent"
import { EditUserInterfaceProps, UserInterfaceProps } from "./UserInterface"
import { hasTokens, replaceTokens } from "lib/tokenReplacer"

interface ComponentRendererProps {
  componentLimit?: number
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  getRootData: () => UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: EditUserInterfaceProps["onChangeSchema"]
  submit?: UserInterfaceProps["submit"]
  onDrop?: DroppableContextType["onDrop"]
}

export const ComponentRendererModeContext = React.createContext<UserInterfaceProps["mode"]>("display")

export const UI_ROOT = "UI-Root"

export const _ComponentRenderer = ({
  componentLimit,
  components,
  data,
  getRootData,
  dragDropDisabled,
  mode: propMode,
  onChangeData,
  onChangeSchema,
  submit,
  onDrop,
}: ComponentRendererProps): JSX.Element => {
  // const { componentRegistry } = React.useContext(ComponentRegistryContext)
  const contextMode = React.useContext(ComponentRendererModeContext)
  const mode = propMode || contextMode

  const handleChangeSchema = React.useCallback(
    (index: number) => (newComponentDefinition: ComponentDefinition) => {
      if (mode === "edit") {
        onChangeSchema && onChangeSchema(set(index, newComponentDefinition, components))
      }
    },
    [components, mode, onChangeSchema]
  )

  const content = components.map((componentDefinition, index) => {
    return (
      <DataPathContext path={index} key={`${componentDefinition.component}-${index}`}>
        {(path) => (
          <DetokenizedComponent
            componentDefinition={componentDefinition}
            data={data}
            dragDropDisabled={dragDropDisabled}
            getRootData={getRootData}
            index={index}
            mode={mode}
            onChangeData={onChangeData}
            onChangeSchema={handleChangeSchema(index)}
            path={path}
            submit={submit}
          />
        )}
      </DataPathContext>
    )
  })

  // console.log("ComponentRenderer.render", { components, data })

  return (
    <div>
      <ComponentRendererModeContext.Provider value={mode}>
        {mode === "edit" && !dragDropDisabled ? (
          <DataPathContext>
            {(path) => (
              <Droppable
                data={components}
                allowDrop={!componentLimit || components.length < componentLimit}
                droppableId={path || UI_ROOT}
                onDrop={onDrop}
                type="INTERFACE_COMPONENT">
                {(/*{ isOver }*/) => content}
              </Droppable>
            )}
          </DataPathContext>
        ) : (
          content
        )}
      </ComponentRendererModeContext.Provider>
    </div>
  )
}

_ComponentRenderer.defaultProps = {
  components: [],
}

export const ComponentRenderer = React.memo(_ComponentRenderer, (prevProps, nextProps) => {
  const simplePropEquality = shallowPropCheck(["components", "data", "mode"])(prevProps, nextProps)
  const runDeepDiff = () => deepDiff(prevProps, nextProps, (k) => ["onChangeSchema", "onChangeData"].includes(k))
  // console.log("ComponentRenderer.memo", simplePropEquality, runDeepDiff())

  return simplePropEquality && !runDeepDiff()
})

function DetokenizedComponent(props: {
  componentDefinition: ComponentDefinition & { valueKey?: string; defaultValue?: any }
  data: UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  getRootData: () => UserInterfaceProps["data"]
  index: number
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"]
  path: string
  submit?: UserInterfaceProps["submit"]
}) {
  const {
    componentDefinition,
    data,
    dragDropDisabled,
    getRootData,
    index,
    mode,
    onChangeData,
    onChangeSchema,
    path,
    submit,
  } = props

  /**
   * Allow any prop to use a token that gets parentRowData from the model.
   * @param componentDefinition
   * @param data
   */
  const componentDef = React.useMemo(() => {
    if (mode === "edit") {
      return componentDefinition
    }
    const newDef: ComponentDefinition = { ...componentDefinition }

    forIn(newDef, (value: any, key: string) => {
      let newValue = value
      if (typeof value === "string" && hasTokens(value)) {
        newValue = replaceTokens(newDef[key] as string, data, componentDefinition.valueKey || "", mode)
      }
      newDef[key] = newValue
    })
    // console.log("replacePropTokens", { componentDefinition, newDef })
    return newDef
  }, [componentDefinition, data, mode])

  return (
    <RenderInterfaceComponent
      Component={registry.lookup(componentDef.component)}
      componentDefinition={componentDef}
      data={data}
      dragDropDisabled={dragDropDisabled}
      getRootData={getRootData}
      index={index}
      mode={mode}
      onChangeData={onChangeData}
      onChangeSchema={onChangeSchema}
      path={path}
      submit={submit}
    />
  )
}
