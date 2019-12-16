import { ActivityIndicator, Modal } from "@ant-design/react-native"
import React from "react"
import { Text, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { usePromotionsContext } from "providers/promotions-context-provider"
import { ImageUris, routes } from "constants"
import NavButton from "components/NavButton"
import { ImageGrid } from "components/ImageGrid"

interface PromotionsCampaignTemplateScreenNavigationParams {
  promotionId: GUID
}

export interface PromotionsCampaignTemplateScreenProps
  extends NavigationTabScreenProps<PromotionsCampaignTemplateScreenNavigationParams> {}

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
              navigate(routes.Promotions.Campaign, {
                isDraft: true,
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
      navigate(routes.Promotions.Campaign, {
        isDraft: true,
        promotionId,
        template: pressedTemplate,
      })
    },
    [campaignTemplatesById, navigate]
  )

  const images: ImageType[] = React.useMemo(
    () =>
      campaignTemplatesBySearchKey[searchText]
        ? campaignTemplatesBySearchKey[searchText].map(({ id, template: { previewImage } }) => ({
            id,
            source: { uri: previewImage || ImageUris.placeholder },
          }))
        : [],
    [campaignTemplatesBySearchKey[searchText]]
  )

  if (
    !promotionsContext.lastLoadCampaignTemplates[searchText] &&
    !promotionsContext.loading.loadCampaignTemplates[JSON.stringify([searchText])]
  ) {
    console.log(promotionsContext.loading.loadCampaignTemplates)
    promotionsContext.loadCampaignTemplates(searchText)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return <ImageGrid images={images} onPress={onPressImage} cols={2} />
}

PromotionsCampaignTemplatesScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: <HeaderTitle title="Choose a Template" />,
    headerRight: (
      <NavButton position="right" onPress={() => navigation.navigate(routes.Promotions.Promotions)}>
        Cancel
      </NavButton>
    ),
  }
}
