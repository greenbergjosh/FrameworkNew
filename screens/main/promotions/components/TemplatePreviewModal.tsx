import { Modal, Flex, Button, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { Text, View, Image } from "react-native"
import { devBorder, routes, Colors, Units } from "constants"
import { CampaignTemplate } from "api/promotions-services"

export type TemplateSelectionType = { campaignTemplate: CampaignTemplate; promotionId: GUID }

export interface TemplatePreviewModalProps {
  selected: TemplateSelectionType
  navigate
}

const initialState: TemplateSelectionType = {
  campaignTemplate: {
    id: null,
    advertiserUserId: null,
    name: null,
    template: {
      retailerTokens: null,
      previewImage: null,
    },
    externalUrl: null,
    meta: null,
  },
  promotionId: null,
}

export const TemplatePreviewModal = ({ selected, navigate }: TemplatePreviewModalProps) => {
  const [visible, setVisible] = React.useState(false)
  const [templateSelection, setTemplateSelection] = React.useState(initialState)

  React.useMemo(() => {
    if (selected !== null) {
      setTemplateSelection(selected)
      setVisible(true)
    }
  }, [selected])

  const { campaignTemplate, promotionId } = templateSelection

  const cancelHandler = React.useCallback(() => setVisible(false), [setVisible])

  const chooseHandler = React.useCallback(() => {
    navigate(routes.Promotions.Campaign, {
      isDraft: true,
      promotionId,
      campaignTemplate: campaignTemplate,
    })
    setVisible(false)
  }, [selected, navigate])

  return (
    <Modal
      transparent={false}
      animationType="slide-up"
      onClose={cancelHandler}
      visible={visible}
      style={{ padding: 0 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          justifyContent: "flex-start",
          alignContent: "stretch",
          alignItems: "flex-start",
          height: "100%",
        }}>
        <View
          style={{
            flexGrow: 1,
            flexShrink: 1,
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            justifyContent: "center",
            alignContent: "stretch",
            alignItems: "flex-start",
          }}>
          <Image
            source={{ uri: campaignTemplate.template.previewImage }}
            style={{
              width: "100%",
              aspectRatio: 1,
            }}
          />
        </View>
        <Flex
          direction="row"
          style={{
            flexGrow: 0,
            flexShrink: 1,
          }}>
          <Button onPress={cancelHandler} style={{ flexGrow: 1, borderRadius: 0 }}>
            Cancel
          </Button>
          <Button onPress={chooseHandler} style={{ flexGrow: 1, borderRadius: 0 }} type="primary">
            Choose
          </Button>
        </Flex>
        <WhiteSpace size="xl" />
      </View>
    </Modal>
  )
}
