import { routes, Units } from "constants"
import { CampaignRow } from "./CampaignRow"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import { Icon } from "@ant-design/react-native"
import React from "react"
import { Campaign, Promotion } from "data/api/promotions"
import { Empty } from "components/Empty"

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
        ListEmptyComponent={
          <Empty message="No campaigns found" style={{ padding: Units.margin }} />
        }
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
