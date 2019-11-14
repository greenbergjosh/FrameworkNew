import { Button, Icon, Modal } from "@ant-design/react-native"
import { useActionSheet } from "@expo/react-native-action-sheet"
import React from "react"
import { Text, View } from "react-native"
import MasonryList from "react-native-masonry-list"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"
import { PromotionsCampaignScreenState } from "./PromotionsCampaignScreen"
import {
  PhotoSelectStatus,
  useActionSheetTakeSelectPhoto,
} from "../../../hooks/useActionSheetTakeSelectPhoto"

const placeholderImage = require("../../../assets/add-photo-placeholder.png")
interface PromotionsCampaignAdditionalImagesScreenNavigationParams {
  images?: string[]
  draft: boolean
  influencerTokens: PromotionsCampaignScreenState["influencerTokens"]
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
      setParams({ images: [...(params.images || []), result.image] })
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
      <View
        style={{
          height: 45,
          backgroundColor: "#F8F8F8",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Button
          style={{
            marginLeft: 16,
            backgroundColor: "#F8F8F8",
            borderWidth: 0,
            paddingLeft: 0,
            paddingRight: 0,
          }}
          onPress={() => navigate("PromotionsCampaign", params)}>
          <Icon name="left" color="#888888" size="lg" />
        </Button>
        <View style={{ paddingLeft: -80 }}>
          <Text style={{ color: "#000", fontSize: 19, fontWeight: "700" }}>Add Feed Photos</Text>
        </View>
        <Text></Text>
      </View>
      <View>
        <Text style={{ color: "#707070", fontSize: 16, padding: 16, paddingBottom: 12 }}>
          These images will appear in other people’s feeds. But if you don’t provide any, we’ll use
          the campaign photo.
        </Text>
      </View>
      <MasonryList images={images} columns={3} onPressImage={onPressImage} rerender />
    </>
  )
}

PromotionsCampaignAdditionalImagesScreen.navigationOptions = ({ navigation }) => {
  console.log("PromotionsCampaignScreen#navigationOptions", navigation.state)
  const { draft, influencerTokens } = navigation.state
    .params as PromotionsCampaignAdditionalImagesScreenNavigationParams
  return {
    headerLeft:
      draft &&
      (() => (
        <Button
          onPress={() => navigation.goBack("PromotionsCampaignList")}
          style={{ backgroundColor: "#343997", borderWidth: 0 }}>
          <Text style={{ color: "#fff" }}>Cancel</Text>
        </Button>
      )),
    headerTitle: () => <HeaderTitle title={draft ? "Create Campaign" : "Campaign"} />,
    headerRight: () => <HeaderRightDoneButton navigation={navigation} />,
  }
}

interface HeaderRightDoneButtonProps {
  navigation: PromotionsCampaignAdditionalImagesScreenProps["navigation"]
}

const HeaderRightDoneButton = ({ navigation }: HeaderRightDoneButtonProps) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const options = ["Save Draft", "Publish", "Cancel"]
  const cancelButtonIndex = 2

  return (
    <Button
      onPress={() => {
        showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
          },
          async (buttonIndex) => {
            const action =
              buttonIndex === 0 ? "saveDraft" : buttonIndex === 1 ? "publish" : "cancel"
            console.log("Create Campaign", navigation.state, action)
          }
        )
      }}
      style={{ backgroundColor: "#343997", borderWidth: 0 }}>
      <Text style={{ fontWeight: "bold", color: "#fff" }}>Done</Text>
    </Button>
  )
}
