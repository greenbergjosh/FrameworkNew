import { Modal } from "@ant-design/react-native"
import { CampaignTemplate } from "api/promotions-services"
import { HeaderTitle } from "components/HeaderTitle"
import { P } from "components/Markup"
import NavButton from "components/NavButton"
import { SubHeader } from "components/SubHeader"
import { routes, Units } from "constants"
import React from "react"
import { Alert, Text } from "react-native"
import MasonryList from "react-native-masonry-list"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderRightDoneButton } from "./components/HeaderRightDoneButton"
import { InfluencerTokens } from "./PromotionsCampaignScreen"
import {
  PhotoSelectStatus,
  useActionSheetTakeSelectPhoto,
} from "hooks/useActionSheetTakeSelectPhoto"

const placeholderImage = require("assets/add-photo-placeholder.png")
interface PromotionsCampaignAdditionalImagesScreenNavigationParams {
  isDraft: boolean
  images?: string[]
  influencerTokens: InfluencerTokens
  promotionId: GUID
  template: CampaignTemplate
}

export interface PromotionsCampaignAdditionalImagesScreenProps
  extends NavigationTabScreenProps<PromotionsCampaignAdditionalImagesScreenNavigationParams> {}

export const PromotionsCampaignAdditionalImagesScreen = (
  props: PromotionsCampaignAdditionalImagesScreenProps
) => {
  const {
    navigate,
    setParams,
    state: { params },
  } = props.navigation
  const images = React.useMemo(
    () =>
      (params.images || [])
        .map((image: string) => ({
          source: { uri: image },
          dimensions: { width: 120, height: 120 },
        }))
        .concat({
          source: placeholderImage,
          dimensions: { width: 120, height: 120 },
        }),
    [params.images]
  )

  const imagePrompt = useActionSheetTakeSelectPhoto((result) => {
    if (result.status === PhotoSelectStatus.SUCCESS) {
      setParams({ images: [...(params.images || []), result.base64] })
    }
  })

  const onPressImage = React.useCallback(
    (object, index) => {
      if (index === images.length - 1) {
        imagePrompt()
      } else {
        Modal.alert("Remove Photo?", <Text>Would you like to remove this photo?</Text>, [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            style: { color: "#FF0000" },
            onPress: () => {
              setParams({
                images: [...params.images.slice(0, index), ...params.images.slice(index + 1)],
              })
            },
          },
        ])
      }
    },
    [images]
  )

  return (
    <>
      <SubHeader
        title="Add Feed Photos"
        onLeftPress={() => navigate(routes.Promotions.Campaign, params)}
        leftIconName="left"
      />
      <P style={{ margin: Units.margin }}>
        These images will appear in other people&rsquo;s feeds. But if you don&rsquo;t provide any,
        we&rsquo;ll use the campaign photo.
      </P>
      <MasonryList images={images} columns={3} onPressImage={onPressImage} rerender />
    </>
  )
}

PromotionsCampaignAdditionalImagesScreen.navigationOptions = ({ navigation }) => {
  const { navigate } = navigation
  const { isDraft, influencerTokens } = navigation.state
    .params as PromotionsCampaignAdditionalImagesScreenNavigationParams
  const cancelHandler = () => {
    Alert.alert("Are you sure you want to lose your changes and cancel?", null, [
      {
        text: "Cancel",
        style: "cancel",
      },
      { text: "OK", onPress: () => navigate(routes.Promotions.Promotions) },
    ])
  }
  return {
    headerLeft: () =>
      isDraft && (
        <NavButton onPress={cancelHandler} position="left">
          Cancel
        </NavButton>
      ),
    headerTitle: <HeaderTitle title={isDraft ? "Create Campaign" : "Campaign"} />,
    headerRight: <HeaderRightDoneButton navigation={navigation} />,
  }
}
