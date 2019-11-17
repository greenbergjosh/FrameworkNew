import { ActivityIndicator, Modal } from "@ant-design/react-native"
import React from "react"
import { Text, View } from "react-native"
import MasonryList from "react-native-masonry-list"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"
import { usePromotionsContext } from "../../../providers/promotions-context-provider"

interface PromotionsCampaignTemplateScreenNavigationParams {
  promotionId: GUID
}

export interface PromotionsCampaignTemplateScreenProps
  extends NavigationTabScreenProps<PromotionsCampaignTemplateScreenNavigationParams> {}

interface ImageItem {
  id: string
  uri: string
}

export const PromotionsCampaignTemplatesScreen = (props: PromotionsCampaignTemplateScreenProps) => {
  const promotionsContext = usePromotionsContext()
  const [searchText, setSearchText] = React.useState("")
  const {
    navigate,
    state: {
      params: { promotionId },
    },
  } = props.navigation

  const { campaignTemplatesBySearchKey, campaignTemplatesById } = promotionsContext
  const onLongPressImage = React.useCallback(
    ({ id }) => {
      const pressedTemplate = campaignTemplatesById[id]
      Modal.alert(
        "Template Details",
        <View style={{ flexDirection: "column" }}>
          <Text>Name: {pressedTemplate.name}</Text>
          <Text>
            Keywords: {pressedTemplate.meta ? pressedTemplate.meta.split(" ").join(", ") : "None"}
          </Text>
          <Text>Created By: {pressedTemplate.advertiserUserId}</Text>
        </View>,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Select Template",
            onPress: () => {
              navigate("PromotionsCampaign", {
                draft: true,
                promotionId,
                template: pressedTemplate,
              })
            },
          },
        ]
      )
    },
    [campaignTemplatesById, navigate]
  )
  const onPressImage = React.useCallback(
    ({ id }) => {
      const pressedTemplate = campaignTemplatesById[id]
      navigate("PromotionsCampaign", { draft: true, promotionId, template: pressedTemplate })
    },
    [campaignTemplatesById, navigate]
  )

  const images: ImageItem[] = React.useMemo(
    () =>
      campaignTemplatesBySearchKey[searchText]
        ? campaignTemplatesBySearchKey[searchText].map(({ id, template: { previewImage } }) => ({
            id,
            uri: previewImage,
          }))
        : [],
    [campaignTemplatesBySearchKey[searchText]]
  )

  if (!promotionsContext.lastLoadCampaignTemplates[searchText]) {
    promotionsContext.loadCampaignTemplates(searchText)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <MasonryList
      images={images}
      onLongPressImage={onLongPressImage}
      onPressImage={onPressImage}
      rerender
    />
  )
}

PromotionsCampaignTemplatesScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderTitle title="Choose a Template" offset="left" />,
  }
}
