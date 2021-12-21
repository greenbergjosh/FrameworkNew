import { Col, Modal, Row, Typography } from "antd"
import React from "react"
import { Settings } from "./Settings"
import { isEmpty } from "lodash/fp"
import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"
import { AbstractBaseInterfaceComponentType } from "components/BaseInterfaceComponent/types"
import { registry } from "services/ComponentRegistry"

export interface SettingsModalProps {
  componentDefinition: Partial<ComponentDefinition> | null
  onCancel: () => void
  onConfirm: (componentDefinition: Partial<ComponentDefinition> | null) => void
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  userInterfaceData: UserInterfaceProps["data"]
  showModal: boolean
}

export const SettingsModal = (props: SettingsModalProps): JSX.Element | null => {
  const [draftComponentDefinition, setDraftComponentDefinition] =
    React.useState<Partial<ComponentDefinitionNamedProps> | null>(props.componentDefinition)
  const [Component, setComponent] = React.useState<AbstractBaseInterfaceComponentType>()

  /*
   * Manage the Draft componentDefinition.
   * Put an mutable copy of the componentDefinition with default values into the modal.
   */
  React.useEffect(() => {
    if (!Component) {
      return
    }
    if (!draftComponentDefinition && props.componentDefinition) {
      // Create the draft
      const defaults = (Component && Component.getManageFormDefaults()) || {}
      const newComponentDefinition = { ...defaults, ...props.componentDefinition }
      setDraftComponentDefinition(newComponentDefinition)
    } else if (!props.componentDefinition) {
      // Remove the draft
      setDraftComponentDefinition(null)
    }
  }, [Component, draftComponentDefinition, props.componentDefinition])

  /*
   * Get the component from the registry
   */
  React.useEffect(() => {
    let isMounted = true

    setComponent(undefined)
    setDraftComponentDefinition(null)
    if (props.componentDefinition && props.componentDefinition.component) {
      registry.lookup(props.componentDefinition.component).then((component) => {
        if (isMounted) {
          // Why do we need to set an anonymous function into state?
          // Otherwise we get "Can't set props of undefined" error.
          setComponent(() => component)
        }
      })
    }

    /* Prevent memory leaks */
    return () => {
      isMounted = false
    }
  }, [props.componentDefinition])

  const { layoutDefinition, manageForm } = React.useMemo(() => {
    const layoutDefinition = Component && Component.getLayoutDefinition()
    const manageForm = Component && Component.manageForm()
    return { layoutDefinition, manageForm }
  }, [Component])

  if (!layoutDefinition || !manageForm || !Component) {
    return null
  }

  return (
    <Modal
      title={`${layoutDefinition && layoutDefinition.title} component`}
      visible={props.showModal}
      okText="Save"
      onCancel={props.onCancel}
      onOk={() => props.onConfirm(draftComponentDefinition)}
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
                getRootUserInterfaceData={props.getRootUserInterfaceData}
                onChangeRootData={props.onChangeRootData}
              />
            )}
          </Col>
        </Row>
      </div>
    </Modal>
  )
}
