import React from "react"
import { DataPathContext } from "../../../../contexts/DataPathContext"
import { ComponentRenderer, RenderInterfaceComponent } from "../../../../components/ComponentRenderer"
import { registry } from "../../../../services/ComponentRegistry"
import { RouteRendererProps } from "../types"
import { ComponentDefinition } from "../../../../globalTypes"
import { set } from "lodash/fp"

export function RouteRenderer(props: RouteRendererProps): JSX.Element {
  // function handleChangeSchema(newSchema: ComponentDefinition) {
  //   if (props.mode === "edit") {
  //     props.onChangeSchema &&
  //       props.userInterfaceSchema &&
  //       props.onChangeSchema(set("components", newSchema, props.userInterfaceSchema))
  //   }
  // }

  return (
    <div style={{ border: "solid 2px orange" }}>
      <DataPathContext path={"components"}>
        <ComponentRenderer
          components={[props.component]}
          data={props.userInterfaceData}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          onChangeRootData={props.onChangeRootData}
          mode={props.mode}
          onChangeData={props.onChangeData}
          onChangeSchema={() => void 0}
        />
      </DataPathContext>
    </div>
  )
}

// {(path) => (
//   <RenderInterfaceComponent
//     Component={registry.lookup((props.component as ComponentDefinition).component)}
//     componentDefinition={props.component as ComponentDefinition}
//     userInterfaceData={props.userInterfaceData}
//     dragDropDisabled={props.dragDropDisabled}
//     getRootUserInterfaceData={props.getRootUserInterfaceData}
//     onChangeRootData={props.onChangeRootData}
//     onVisibilityChange={props.onVisibilityChange}
//     mode={props.mode}
//     onChangeData={props.onChangeData}
//     onChangeSchema={handleChangeSchema}
//     path={path}
//     submit={props.submit}
//     index={0}
//   />
// )}
