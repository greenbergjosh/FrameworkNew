import { ActivityIndicator, Button, Modal } from "@ant-design/react-native"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { baseAddress } from "api"
import { CampaignTemplate, createCampaign } from "api/promotions-services"
import { HeaderTitle } from "components/HeaderTitle"
import { P } from "components/Markup"
import { SubHeader } from "components/SubHeader"
import { Colors, routes, Units } from "constants"
import React from "react"
import { Clipboard, Text } from "react-native"
import MasonryList from "react-native-masonry-list"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { InfluencerTokens } from "./PromotionsCampaignScreen"
import {
  PhotoSelectStatus,
  useActionSheetTakeSelectPhoto,
} from "hooks/useActionSheetTakeSelectPhoto"

const placeholderImage = require("assets/add-photo-placeholder.png")
interface PromotionsCampaignAdditionalImagesScreenNavigationParams {
  draft: boolean
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
  const { draft, influencerTokens } = navigation.state
    .params as PromotionsCampaignAdditionalImagesScreenNavigationParams
  return {
    headerLeft:
      draft &&
      (() => (
        <Button
          onPress={() => navigation.goBack("PromotionsCampaignList")}
          style={{ backgroundColor: Colors.ggNavy, borderWidth: 0 }}>
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
  const [workingText, setWorkingText] = React.useState<string | null>(null)
  const { images, influencerTokens, promotionId, template } = navigation.state.params
  const options = ["Save Draft", "Publish", "Cancel"]
  const cancelButtonIndex = 2

  const pressDoneHandler = () => {
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        if (buttonIndex === 0) {
          alert("Save draft\nFeature to come!")
          // Save Draft
        } else if (buttonIndex === 1) {
          setWorkingText("Publishing...")
          // Publish Campaign
          const newCampaign = {
            promotionId,
            feedImage: images[0],
            templateParts: influencerTokens,
            messageBodyTemplateId: template.id,
            messageBodyTemplateName: "",
            messageBodyTemplateUrl: "",
            approvedByAdvertiser: "0",
            subject: "Campaign",
          }
          const publishResult = await createCampaign(newCampaign)
          setWorkingText(null)

          if (publishResult.r === 0) {
            Modal.alert(
              "Campaign Created",
              <Text>The campaign was successfully created! Copy the sharing link?</Text>,
              [
                {
                  text: "Later",
                  style: "cancel",
                  onPress: () => {
                    navigation.navigate(routes.Promotions.CampaignList, { promotionId })
                  },
                },

                {
                  text: "Copy",
                  onPress: () => {
                    Clipboard.setString(`${baseAddress}/c/${publishResult.result.id}`)
                    setTimeout(() => {
                      Modal.alert("Link Copied!", null, [
                        {
                          text: "OK",
                          onPress: () => {
                            navigation.navigate(routes.Promotions.CampaignList, {
                              promotionId,
                            })
                          },
                        },
                      ])
                    }, 1000)
                  },
                },
              ]
            )
          } else {
            alert(`Failed to publish campaign (Code ${publishResult.r}): ${publishResult.error}`)
          }
        }
      }
    )
  }

  return (
    <>
      <ActivityIndicator animating={!!workingText} toast size="large" text={workingText} />
      <Button onPress={pressDoneHandler} style={{ backgroundColor: Colors.ggNavy, borderWidth: 0 }}>
        <Text style={{ fontWeight: "bold", color: "#fff" }}>Done</Text>
      </Button>
    </>
  )
}
