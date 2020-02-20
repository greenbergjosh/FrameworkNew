import React from "react"
import Collapsible from "react-native-collapsible"
import { ActivityIndicator, Flex } from "@ant-design/react-native"
import { PromotionType } from "data/api/promotions"
import { PromotionsScreenProps } from "screens/main/promotions/PromotionsScreen"
import { Units } from "styles"
import { PromotionCard } from "./PromotionCard"
import { CampaignsList } from "./CampaignsList"
import { ExpanderIcon } from "./ExpanderIcon"
import { CampaignsListEmpty } from "./CampaignsListEmpty"
import { usePromotionsContext } from "data/contextProviders/promotions.contextProvider"

export interface PromotionExpanderProps {
  alwaysExpanded?: boolean
  navigate: PromotionsScreenProps["navigation"]["navigate"]
  promotion: PromotionType
  isArchived?: boolean
}

export const PromotionExpander = ({
  navigate,
  promotion,
  alwaysExpanded = false,
  isArchived = false,
}: PromotionExpanderProps) => {
  const promotionsContext = usePromotionsContext()
  const [isCollapsed, setCollapsed] = React.useState(true)
  const [isLoading, setLoading] = React.useState(false)
  const loading = promotionsContext.loading.loadPromotionCampaigns[promotion.id]
  const campaigns = promotionsContext.campaignsByPromotion[promotion.id]

  const showCampaignsHandler = () => {
    return async () => {
      if (!campaigns && isCollapsed) {
        setLoading(true)
        await promotionsContext.loadPromotionCampaigns(promotion.id)
        setLoading(false)
        setCollapsed(!isCollapsed)
      } else {
        setCollapsed(!isCollapsed)
      }
    }
  }

  return (
    <>
      <Flex direction="column" style={{ position: "relative" }}>
        <PromotionCard
          onPress={showCampaignsHandler()}
          promotional={promotion.payload}
          promotionId={promotion.id}
          expires={promotion.expires}
          isArchived={isArchived}
          campaignCount={2}
          navigate={navigate}
        />
        {!alwaysExpanded && <ExpanderIcon collapsed={isCollapsed} />}
      </Flex>
      <Collapsible
        collapsed={!alwaysExpanded && !isLoading}
        align="bottom"
        style={{ padding: Units.margin }}>
        <ActivityIndicator animating size="large" text="Loading..." />
      </Collapsible>
      <Collapsible collapsed={!alwaysExpanded && isCollapsed}>
        {!campaigns || loading ? null : campaigns.length > 0 ? (
          <CampaignsList
            campaigns={campaigns}
            promotion={promotion}
            alwaysExpanded={alwaysExpanded}
            navigate={navigate}
          />
        ) : (
          <CampaignsListEmpty promotionId={promotion.id} navigate={navigate} />
        )}
      </Collapsible>
    </>
  )
}
