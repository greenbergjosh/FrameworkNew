import { Col, Modal, Row, Typography } from "antd"
import React from "react"
import { ComponentDefinition } from "../components/base/BaseInterfaceComponent"
import { registry } from "../registry"
import { ManageComponentForm } from "./ManageComponentForm"
import { ManageComponentPreview } from "./ManageComponentPreview"
import { isEmpty } from "lodash/fp"

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
    console.log("ManageComponentModal useEffect", { componentDefinition, propComponentDefinition })
    if (!componentDefinition && propComponentDefinition) {
      const Component = propComponentDefinition.component && registry.lookup(propComponentDefinition.component)

      // Determine the default values for this component
      const defaults = (Component && Component.getManageFormDefaults()) || {}
      const newComponentDefinition = { ...defaults, ...propComponentDefinition }
      // Set the active component in the modal to be the one with all the defaults entered
      updateComponentDefinition(newComponentDefinition)
    } else if (!propComponentDefinition) {
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
        console.log("ManageComponentModal.onOk", e, componentDefinition)
        onConfirm(componentDefinition as ComponentDefinition)
      }}
      style={{ maxWidth: "1200px", width: "95%" }}
      width="95%">
      <div>
        <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]} type="flex">
          <Col span={16}>
            {layoutDefinition && !isEmpty(layoutDefinition.description) && (
              <p>{layoutDefinition && layoutDefinition.description}</p>
            )}
            <Typography.Title level={4}>Definition</Typography.Title>
            {layoutDefinition && componentDefinition && manageForm && (
              <ManageComponentForm
                componentDefinition={componentDefinition as ComponentDefinition}
                onChangeDefinition={(newDefinition) => {
                  console.log("ManageComponentModal.onChangeDefinition", newDefinition)
                  updateComponentDefinition({ ...componentDefinition, ...newDefinition })
                }}
                manageForm={manageForm}
                layoutDefinition={layoutDefinition}
              />
            )}
          </Col>
          <Col span={8} style={{ backgroundColor: "#fafafa", paddingBottom: 20, borderRadius: 5 }}>
            <Typography.Title level={4}>Preview</Typography.Title>
            {Component && layoutDefinition && (
              <ManageComponentPreview
                Component={Component}
                componentDefinition={componentDefinition as ComponentDefinition}
                layoutDefinition={layoutDefinition}
              />
            )}
          </Col>
        </Row>
      </div>
    </Modal>
  )
}
