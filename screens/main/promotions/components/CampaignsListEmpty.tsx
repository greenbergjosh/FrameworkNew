import { Empty } from "components/Empty"
import { Text, View } from "react-native"
import React from "react"
import { Colors, styles, Units } from "constants"
import { A } from "components/Markup"

interface CampaignsListEmptyProps {
  onCreateCampaign: () => any
}

export function CampaignsListEmpty({ onCreateCampaign }: CampaignsListEmptyProps) {
  return (
    <Empty
      iconStyle={{ color: Colors.bodyText }}
      message={
        <View style={{ margin: Units.padding, alignItems: "center" }}>
          <Text style={[styles.Body, { marginBottom: Units.padding }]}>
            You haven't created any campaigns for this promotion
          </Text>
          <A onPress={onCreateCampaign}>Create one now?</A>
        </View>
      }
      style={{ paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.childBackground }}
    />
  )
}
