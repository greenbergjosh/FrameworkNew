import { Clipboard } from "react-native"
import { baseAddress } from "data/api/getgotRequest"
import { Modal } from "@ant-design/react-native"

export const copyCampaignLinkHandler = (campaignId, onPress?) => () => {
  Clipboard.setString(`${baseAddress}/c/${campaignId}`)
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
