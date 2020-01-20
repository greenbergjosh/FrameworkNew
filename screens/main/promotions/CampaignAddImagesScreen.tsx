import { Modal } from "@ant-design/react-native"
import { HeaderTitle } from "components/HeaderTitle"
import { P } from "components/Markup"
import NavButton from "components/NavButton"
import { SubHeader } from "components/SubHeader"
import { Colors, routes, Units } from "constants"
import React from "react"
import { Alert, ScrollView, Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderRightDoneButton } from "./components/HeaderRightDoneButton"
import {
  PhotoSelectStatus,
  useActionSheetTakeSelectPhoto,
} from "hooks/useActionSheetTakeSelectPhoto"
import { ImageGrid } from "components/ImageGrid"
import { CampaignRouteParams, InfluencerTokens } from "constants/routeParam.interfaces"

interface CampaignAddImagesScreenNavigationParams extends CampaignRouteParams {
  influencerTokens: InfluencerTokens
  requiredTokens: string[]
  images?: string[]
}

export interface CampaignAddImagesScreenProps
  extends NavigationTabScreenProps<CampaignAddImagesScreenNavigationParams> {}

export const CampaignAddImagesScreen = (
  props: CampaignAddImagesScreenProps
) => {
  const {
    navigate,
    setParams,
    state: { params },
  } = props.navigation

  const images: ImageType[] = React.useMemo(
    // TODO: route param.images should be type ImageType[]
    /*
    Convert route params.images to ImageType[],
    then add the extra "add image" item.
     */
    () =>
      (params.images || []).map((image: string, index) => ({
        id: index.toString(),
        source: { uri: image },
        dimensions: { width: Units.img128, height: Units.img128 },
      })),
    [params.images]
  )

  const imagePrompt = useActionSheetTakeSelectPhoto((result) => {
    if (result.status === PhotoSelectStatus.SUCCESS) {
      setParams({ images: [...(params.images || []), result.base64] })
    }
  })

  function showRemovePhotoModal(index) {
    return Modal.alert("Remove Photo?", <Text>Would you like to remove this photo?</Text>, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: { color: Colors.warning },
        onPress: () => {
          setParams({
            images: [...params.images.slice(0, index), ...params.images.slice(index + 1)],
          })
        },
      },
    ])
  }

  const onPressImage = React.useCallback(
    (object, index) => {
      showRemovePhotoModal(index)
    },
    [images]
  )

  return (
    <>
      <SubHeader
        title="Add Feed Photos"
        onLeftPress={() => navigate(routes.Promotions.Campaign, params)}
      />
      <P style={{ margin: Units.margin }}>
        These images will appear in other people&rsquo;s feeds. But if you don&rsquo;t provide any,
        we&rsquo;ll use the campaign photo.
      </P>
      <ScrollView>
        <ImageGrid images={images} onItemPress={onPressImage} onAddPhoto={imagePrompt} />
      </ScrollView>
    </>
  )
}

CampaignAddImagesScreen.navigationOptions = ({ navigation }) => {
  const { navigate } = navigation
  const { isDraft } = navigation.state
    .params as CampaignAddImagesScreenNavigationParams
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
