import { Clipboard } from "react-native"
import { TEMPLATE_BASE_URL } from "constants/urls"
import { Modal } from "@ant-design/react-native"

// TODO: Rewrite this as a hook
export const copyCampaignLinkHandler = (campaignId, onPress?) => () => {
  Clipboard.setString(`${TEMPLATE_BASE_URL}/c/${campaignId}`)
  setTimeout(() => {
    Modal.alert(
      "Link copied to clipboard!",
      "This campaign has been saved. You can paste this link in any of your social media applications.",
      [
        {
          text: "OK",
          onPress,
        },
      ]
    )
  }, 500)
}
