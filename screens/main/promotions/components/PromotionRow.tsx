import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import Collapsible from "react-native-collapsible"
import { ActivityIndicator, Icon } from "@ant-design/react-native"
import Item from "@ant-design/react-native/lib/list/ListItem"
import { Campaign, Promotion } from "api/promotions-services"
import { PromotionsScreenProps } from "screens/main/promotions/PromotionsScreen"
import { CampaignRow } from "./CampaignRow"
import { Empty } from "components/Empty"
import { routes } from "constants"
import { PromotionCard } from "./PromotionCard"

const DEFAULT_IMAGE = "https://facebook.github.io/react-native/img/tiny_logo.png"
const EXPANDED_CAMPAIGN_THRESHOLD = 3

export interface PromotionRowProps {
  alwaysExpanded?: boolean
  campaigns?: Campaign[]
  loading?: boolean
  navigate: PromotionsScreenProps["navigation"]["navigate"]
  onExpand?: () => void
  promotion: Promotion
}

function EmptyCampaigns(props: { onPress: () => any }) {
  return <Empty
    message={
      <>
        <Text>You haven't created any campaigns for this promotion. </Text>
        <Text style={{ color: "#0000FF" }} onPress={props.onPress}>
          Create one now?
        </Text>
      </>
    }
    style={{ paddingTop: 10, paddingBottom: 10 }}
  />
}

export const PromotionRow = ({
  alwaysExpanded,
  campaigns,
  loading,
  navigate,
  onExpand,
  promotion,
}: PromotionRowProps) => {
  const [isCollapsed, setCollapsed] = React.useState(true)
  const navigateToCreateCampaign = React.useCallback(
    () => navigate(routes.Promotions.CampaignTemplates, { promotionId: promotion.id }),
    [promotion.id]
  )

  return (
    <Item
      wrap
      arrow={null}
      extra={null}
      style={{
        padding: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
      }}
      styles={{
        underlayColor: { backgroundColor: "transparent" },
        Line: { paddingRight: 0 },
      }}>
      <PromotionCard
        alwaysExpanded={alwaysExpanded}
        loading={loading}
        onPress={() => {
          onExpand && isCollapsed && onExpand()
          setCollapsed(!isCollapsed)
        }}
        payload={promotion.payload}
        collapsed={isCollapsed}
        expires={promotion.expires}
        onPress1={navigateToCreateCampaign}
      />
      <Collapsible collapsed={!alwaysExpanded && isCollapsed}>
        {!campaigns || loading ? (
          <ActivityIndicator animating size="large" text="Loading..." />
        ) : (
          <View style={{ backgroundColor: "#F8F8F8EB" }}>
            {campaigns.length > 0 ? (
              <>
                {campaigns
                  .slice(0, alwaysExpanded ? campaigns.length : EXPANDED_CAMPAIGN_THRESHOLD)
                  .map((campaign) => (
                    <CampaignRow
                      key={campaign.id}
                      navigate={navigate}
                      campaign={campaign}
                      promotion={promotion}
                    />
                  ))}
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
                      <Text>{campaigns.length - EXPANDED_CAMPAIGN_THRESHOLD} more</Text>
                      <Icon name="right" />
                    </View>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <EmptyCampaigns onPress={navigateToCreateCampaign}/>
            )}
          </View>
        )}
      </Collapsible>
    </Item>
  )
}
