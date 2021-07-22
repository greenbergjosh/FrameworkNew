import { Col, Modal, Row, Typography } from "antd"
import React from "react"
import { registry } from "../../services/ComponentRegistry"
import { Settings } from "./Settings"
import { isEmpty } from "lodash/fp"
import { ComponentDefinition, UserInterfaceProps } from "../../globalTypes"

export interface ManageComponentModalProps {
  componentDefinition: null | Partial<ComponentDefinition>
  onCancel: () => void
  onConfirm: (componentDefinition: ComponentDefinition) => void
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  userInterfaceData: UserInterfaceProps["data"]
}

export const SettingsModal = ({
  componentDefinition: propComponentDefinition,
  onCancel,
  onConfirm,
  getRootUserInterfaceData,
  onChangeRootData,
}: ManageComponentModalProps) => {
  const [componentDefinition, updateComponentDefinition] = React.useState(propComponentDefinition)

  React.useEffect(() => {
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

  return (
    <Modal
      title={`${layoutDefinition && layoutDefinition.title} component`}
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
          <Col span={24}>
            {layoutDefinition && !isEmpty(layoutDefinition.description) && (
              <p>{layoutDefinition && layoutDefinition.description}</p>
            )}
            <Typography.Title level={4}>Definition</Typography.Title>
            {layoutDefinition && componentDefinition && manageForm && (
              <Settings
                componentDefinition={componentDefinition as ComponentDefinition}
                onChangeDefinition={(newDefinition) => {
                  console.log("ManageComponentModal.onChangeDefinition", newDefinition)
                  updateComponentDefinition({ ...componentDefinition, ...newDefinition })
                }}
                manageForm={manageForm}
                layoutDefinition={layoutDefinition}
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
              />
            )}
          </Col>
        </Row>
      </div>
    </Modal>
  )
}
