import { Empty } from "components/Empty"
import { Text, View } from "react-native"
import React from "react"
import { Colors, styles, Units } from "styles"
import { A } from "components/Markup"
import { showCreateCampaignActionSheet } from "./CreateCampaignActionSheet"

interface CampaignsListEmptyProps {
  promotionId: GUID
  navigate
}

export function CampaignsListEmpty({ promotionId, navigate }: CampaignsListEmptyProps) {
  return (
    <Empty
      iconStyle={{ color: Colors.bodyText }}
      message={
        <View style={{ margin: Units.padding, alignItems: "center" }}>
          <Text style={[styles.Body, { marginBottom: Units.padding }]}>
            You haven't created any campaigns for this promotion
          </Text>
          <A onPress={() => showCreateCampaignActionSheet(promotionId, navigate)}>Create one now?</A>
        </View>
      }
      style={{ paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.childBackground }}
    />
  )
}
