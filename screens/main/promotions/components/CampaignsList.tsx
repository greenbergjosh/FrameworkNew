import { routes } from "constants"
import { CampaignRow } from "./CampaignRow"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import { Icon } from "@ant-design/react-native"
import React from "react"
import { Campaign, Promotion } from "api/promotions-services"

const EXPANDED_CAMPAIGN_THRESHOLD = 3

export interface CampaignsListProps {
  campaigns: Campaign[]
  alwaysExpanded: boolean
  promotion: Promotion
  navigate
}

export const CampaignsList = ({
  campaigns,
  promotion,
  alwaysExpanded,
  navigate,
}: CampaignsListProps) => {
  return (
    <>
      {/**********************
       * Campaign Rows
       */}
      <FlatList
        data={campaigns.slice(0, alwaysExpanded ? campaigns.length : EXPANDED_CAMPAIGN_THRESHOLD)}
        renderItem={({ item }) => <CampaignRow navigate={navigate} campaign={item} />}
        keyExtractor={(campaign) => campaign.id}
      />

      {/**********************
       * Overflow Panel
       */}
      {!alwaysExpanded && campaigns.length > EXPANDED_CAMPAIGN_THRESHOLD && (
        <TouchableOpacity
          disabled={alwaysExpanded}
          onPress={() => {
            navigate(routes.Promotions.CampaignList, { promotionId: promotion.id })
          }}>
          <View
            style={{
              height: 60,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Text>{campaigns.length - EXPANDED_CAMPAIGN_THRESHOLD} more campaigns</Text>
            <Icon name="right" size="sm" />
          </View>
        </TouchableOpacity>
      )}
    </>
  )
}
