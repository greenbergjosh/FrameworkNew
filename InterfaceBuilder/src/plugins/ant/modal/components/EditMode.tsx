import React from "react"
import { ComponentDefinition, ComponentRenderMetaProps, UserInterfaceProps } from "globalTypes"
import { ComponentRenderer, RenderInterfaceComponent } from "components/ComponentRenderer"
import { DataPathContext } from "contexts/DataPathContext"
import { set } from "lodash/fp"
import { registry } from "services/ComponentRegistry"

export function EditMode(props: {
  components: ComponentDefinition[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  title: string
  userInterfaceData: UserInterfaceProps["data"]
  userInterfaceSchema?: ComponentDefinition
  footer: {
    components: ComponentDefinition[]
  }
}): JSX.Element {
  const handleTitleChangeData = (newData: any): void => {
    props.onChangeSchema &&
      props.userInterfaceSchema &&
      props.onChangeSchema(set("title", newData.title, props.userInterfaceSchema))
  }

  return (
    <div style={{ backgroundColor: "rgb(236, 236, 236)", padding: 10, margin: -5, border: "solid 1px lightgrey" }}>
      <div
        style={{
          marginBottom: 5,
        }}>
        <RenderInterfaceComponent
          Component={registry.lookup("input")}
          componentDefinition={{
            key: "title",
            valueKey: "title",
            component: "input",
            defaultValue: "Edit Item",
            placeholder: "Enter modal title",
            label: "Title",
            bindable: true,
            getRootUserInterfaceData: props.getRootUserInterfaceData,
            setRootUserInterfaceData: props.setRootUserInterfaceData,
          }}
          userInterfaceData={props.userInterfaceSchema}
          dragDropDisabled={true}
          getRootData={props.getRootUserInterfaceData}
          setRootData={props.setRootUserInterfaceData}
          index={0}
          mode="display"
          onChangeData={handleTitleChangeData}
          onChangeSchema={() => void 0}
          path={"title"}
        />
        {/*<ComponentRenderer*/}
        {/*  components={[*/}
        {/*    {*/}
        {/*      key: "title",*/}
        {/*      valueKey: "title",*/}
        {/*      component: "input",*/}
        {/*      defaultValue: "Edit Item",*/}
        {/*      placeholder: "Enter modal title",*/}
        {/*      label: "Title",*/}
        {/*      bindable: true,*/}
        {/*    },*/}
        {/*  ]}*/}
        {/*  data={props.userInterfaceSchema}*/}
        {/*  mode="display"*/}
        {/*  dragDropDisabled={true}*/}
        {/*  getRootData={props.getRootUserInterfaceData}*/}
        {/*  setRootData={props.setRootUserInterfaceData}*/}
        {/*  onChangeData={handleTitleChangeData}*/}
        {/*  onChangeSchema={() => void 0}*/}
        {/*/>*/}
      </div>
      <span>Content</span>
      <DataPathContext path="components">
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "white",
            marginBottom: 5,
          }}>
          <ComponentRenderer
            components={props.components || ([] as ComponentDefinition[])}
            data={props.userInterfaceData}
            dragDropDisabled={false}
            getRootData={props.getRootUserInterfaceData}
            setRootData={props.setRootUserInterfaceData}
            onChangeData={props.onChangeData}
            onChangeSchema={(newSchema) => {
              props.onChangeSchema &&
                props.userInterfaceSchema &&
                props.onChangeSchema(set("components", newSchema, props.userInterfaceSchema))
            }}
          />
        </div>
      </DataPathContext>
      <span>Footer</span>
      <DataPathContext path="footer.components">
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "white",
          }}>
          <ComponentRenderer
            components={props.footer.components || ([] as ComponentDefinition[])}
            data={props.userInterfaceData}
            dragDropDisabled={false}
            getRootData={props.getRootUserInterfaceData}
            setRootData={props.setRootUserInterfaceData}
            onChangeData={props.onChangeData}
            onChangeSchema={(newSchema) => {
              props.onChangeSchema &&
                props.userInterfaceSchema &&
                props.onChangeSchema(set("footer.components", newSchema, props.userInterfaceSchema))
            }}
          />
        </div>
      </DataPathContext>
    </div>
  )
}
