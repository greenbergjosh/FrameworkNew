import { Modal } from "@ant-design/react-native"
import { CampaignTemplate } from "api/promotions-services"
import { HeaderTitle } from "components/HeaderTitle"
import { P } from "components/Markup"
import NavButton from "components/NavButton"
import { SubHeader } from "components/SubHeader"
import { routes, Units } from "constants"
import React from "react"
import { Alert, ScrollView, Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderRightDoneButton } from "./components/HeaderRightDoneButton"
import { InfluencerTokens } from "./PromotionsCampaignScreen"
import {
  PhotoSelectStatus,
  useActionSheetTakeSelectPhoto,
} from "hooks/useActionSheetTakeSelectPhoto"
import { ImageGrid } from "components/ImageGrid"

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
        .map((image: string, index) => ({
          id: index.toString(),
          source: { uri: image },
          dimensions: { width: Units.img128, height: Units.img128 },
        }))
        .concat({
          id: "edf82f28-b367-4c35-9d6d-275d0084881a",
          source: placeholderImage,
          dimensions: { width: Units.img128, height: Units.img128 },
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
      <ScrollView>
        <ImageGrid images={images} onPress={onPressImage} cols={3} />
      </ScrollView>
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
