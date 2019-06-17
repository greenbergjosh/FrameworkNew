import {
  Col,
  Modal,
  Row,
  Tabs,
  Typography
  } from "antd"
import React from "react"
import { ComponentDefinition } from "../components/base/BaseInterfaceComponent"
import { registry } from "../registry"
import { RenderInterfaceComponent } from "../RenderInterfaceComponent"
import { ManageComponentForm } from "./ManageComponentForm"

export interface ManageComponentModalProps {
  componentDefinition: null | Partial<ComponentDefinition>
  onCancel: () => void
  onConfirm: (componentDefinition: ComponentDefinition) => void
}

export const ManageComponentModal = ({
  componentDefinition: propComponentDefinition,
  onCancel,
  onConfirm,
}: ManageComponentModalProps) => {
  const [componentDefinition, updateComponentDefinition] = React.useState(propComponentDefinition)

  React.useEffect(() => {
    if (propComponentDefinition) {
      updateComponentDefinition(propComponentDefinition)
    }
  }, [componentDefinition, propComponentDefinition])

  const Component =
    componentDefinition &&
    componentDefinition.component &&
    registry.lookup(componentDefinition && componentDefinition.component)
  const layoutDefinition = Component && Component.getLayoutDefinition()
  const manageForm = Component && Component.manageForm()

  console.log("ManageComponentModal.render", { componentDefinition, propComponentDefinition })

  return (
    <Modal
      title={layoutDefinition && layoutDefinition.title}
      visible={!!propComponentDefinition}
      okText="Save"
      onCancel={(e) => {
        console.log("ManageComponentModal.onCancel", e)
        onCancel()
      }}
      onOk={(e) => {
        console.log("ManageComponentModal.onOk", e)
        onConfirm(componentDefinition as ComponentDefinition)
      }}
      style={{ maxWidth: "1200px", width: "95%" }}
      width="95%">
      <div>
        <Row>
          <Col span={16}>
            <Typography.Title level={4}>Definition</Typography.Title>
            {layoutDefinition && componentDefinition && manageForm && (
              <ManageComponentForm
                componentDefintion={componentDefinition as ComponentDefinition}
                manageForm={manageForm}
                layoutDefinition={layoutDefinition}
              />
            )}
          </Col>
          <Col span={8}>
            <Typography.Title level={4}>Preview</Typography.Title>
            {Component && (
              <RenderInterfaceComponent
                Component={Component}
                componentDefinition={componentDefinition as ComponentDefinition}
                index={0}
                mode={"display"}
                path={"TEMP_PATH"}
              />
            )}
          </Col>
        </Row>
      </div>
    </Modal>
  )
}
