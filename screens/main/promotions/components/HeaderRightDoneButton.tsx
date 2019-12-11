import { useActionSheet } from "@expo/react-native-action-sheet"
import React from "react"
import { createCampaign } from "api/promotions-services"
import { ActivityIndicator, Modal } from "@ant-design/react-native"
import { Clipboard, Text } from "react-native"
import { routes } from "constants"
import { baseAddress } from "api"
import { PromotionsCampaignAdditionalImagesScreenProps } from "../PromotionsCampaignAdditionalImagesScreen"
import NavButton from "components/NavButton"

interface HeaderRightDoneButtonProps {
  navigation: PromotionsCampaignAdditionalImagesScreenProps["navigation"]
}

export const HeaderRightDoneButton = ({ navigation }: HeaderRightDoneButtonProps) => {
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
      <NavButton onPress={pressDoneHandler} position="right" type="primary">
        Done
      </NavButton>
    </>
  )
}
