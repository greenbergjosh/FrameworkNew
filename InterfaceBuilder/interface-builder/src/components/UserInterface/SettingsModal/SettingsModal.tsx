import { Col, Modal, Row, Typography } from "antd"
import React from "react"
import { registry } from "../../../services/ComponentRegistry"
import { Settings } from "./Settings"
import { isEmpty } from "lodash/fp"
import { ComponentDefinition } from "../../../globalTypes"
import { AbstractBaseInterfaceComponentType } from "components/BaseInterfaceComponent/types"
import { ManageComponentModalProps } from "components/UserInterface/types"

export const SettingsModal = (props: ManageComponentModalProps): JSX.Element | null => {
  const { componentDefinition, onCancel, onConfirm, getRootUserInterfaceData, onChangeRootData } = props
  const [Component, setComponent] = React.useState<AbstractBaseInterfaceComponentType>()
  const [draftComponentDefinition, setDraftComponentDefinition] = React.useState(componentDefinition)

  /*
   * Put an mutable copy of the componentDefinition with default values into the modal
   */
  React.useEffect(() => {
    if (!draftComponentDefinition && componentDefinition) {
      // Determine the default values for this component
      const defaults = (Component && Component.getManageFormDefaults()) || {}
      const newComponentDefinition = { ...defaults, ...componentDefinition }
      // Set the active component in the modal to be the one with all the defaults entered
      setDraftComponentDefinition(newComponentDefinition)
    } else if (!componentDefinition) {
      setDraftComponentDefinition(componentDefinition)
    }
  }, [Component, draftComponentDefinition, componentDefinition])

  /*
   * Get the component from the registry
   */
  React.useEffect(() => {
    if (componentDefinition && componentDefinition.component) {
      registry.lookup(componentDefinition.component).then((component) => {
        // Why do we need to set an anonymous function into state?
        // Otherwise we get "Can't set props of undefined" error.
        setComponent(() => component)
      })
    }
  }, [componentDefinition])

  const { layoutDefinition, manageForm } = React.useMemo(() => {
    const layoutDefinition = Component && Component.getLayoutDefinition()
    const manageForm = Component && Component.manageForm()
    return { layoutDefinition, manageForm }
  }, [Component])

  if (!layoutDefinition || !manageForm) {
    return null
  }

  return (
    <Modal
      title={`${layoutDefinition && layoutDefinition.title} component`}
      visible={!!componentDefinition}
      okText="Save"
      onCancel={(e) => {
        console.log("ManageComponentModal.onCancel", e)
        onCancel()
      }}
      onOk={(e) => {
        console.log("ManageComponentModal.onOk", e, draftComponentDefinition)
        onConfirm(draftComponentDefinition)
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
            {layoutDefinition && draftComponentDefinition && manageForm && (
              <Settings
                componentDefinition={draftComponentDefinition as ComponentDefinition}
                onChangeDefinition={(newDefinition) => {
                  console.log("ManageComponentModal.onChangeDefinition", newDefinition)
                  setDraftComponentDefinition({ ...draftComponentDefinition, ...newDefinition })
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
