import { ActivityIndicator } from "@ant-design/react-native"
import React from "react"
import { ScrollView } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { usePromotionsContext } from "providers/promotions-context-provider"
import { Colors, ImageUris, routes } from "constants"
import NavButton from "components/NavButton"
import { ImageGrid } from "components/ImageGrid"
import { TemplatePreviewModal, TemplateSelectionType } from "./components/TemplatePreviewModal"

interface PromotionsCampaignTemplateScreenNavigationParams {
  promotionId: GUID
}

export interface PromotionsCampaignTemplateScreenProps
  extends NavigationTabScreenProps<PromotionsCampaignTemplateScreenNavigationParams> {}

export const PromotionsCampaignTemplatesScreen = (props: PromotionsCampaignTemplateScreenProps) => {
  const promotionsContext = usePromotionsContext()
  const [searchText, setSearchText] = React.useState("")
  const [selectedTemplate, setSelectedTemplate] = React.useState(null)
  const { campaignTemplatesBySearchKey, campaignTemplatesById } = promotionsContext
  const {
    navigate,
    state: {
      params: { promotionId },
    },
  } = props.navigation

  /**
   * User Selected Template From Grid
   */
  const imageGridPressHandler = React.useCallback(
    (id) => {
      const selected: TemplateSelectionType = { campaignTemplate: campaignTemplatesById[id], promotionId }
      setSelectedTemplate(selected)
    },
    [campaignTemplatesById, navigate]
  )

  /**
   * Search Filter
   */
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

  /**
   * Load Data
   */
  if (
    !promotionsContext.lastLoadCampaignTemplates[searchText] &&
    !promotionsContext.loading.loadCampaignTemplates[JSON.stringify([searchText])]
  ) {
    console.log(promotionsContext.loading.loadCampaignTemplates)
    promotionsContext.loadCampaignTemplates(searchText)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <ScrollView style={{ backgroundColor: Colors.screenBackground }}>
      <ImageGrid images={images} onPress={imageGridPressHandler} cols={2} />
      <TemplatePreviewModal selected={selectedTemplate} navigate={navigate} />
    </ScrollView>
  )
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
