import React from "react"
import Collapsible from "react-native-collapsible"
import { ActivityIndicator, Flex } from "@ant-design/react-native"
import { Promotion } from "api/promotions-services"
import { PromotionsScreenProps } from "screens/main/promotions/PromotionsScreen"
import { routes, Units } from "constants"
import { PromotionCard } from "./PromotionCard"
import { CampaignsList } from "./CampaignsList"
import { ExpanderIcon } from "./ExpanderIcon"
import { CampaignsListEmpty } from "./CampaignsListEmpty"
import { usePromotionsContext } from "providers/promotions-context-provider"

export interface PromotionExpanderProps {
  alwaysExpanded?: boolean
  navigate: PromotionsScreenProps["navigation"]["navigate"]
  promotion: Promotion
}

export const PromotionExpander = ({
  navigate,
  promotion,
  alwaysExpanded = false,
}: PromotionExpanderProps) => {
  const promotionsContext = usePromotionsContext()
  const [isCollapsed, setCollapsed] = React.useState(true)
  const [isLoading, setLoading] = React.useState(false)
  const createCampaignHandler = React.useCallback(
    () => navigate(routes.Promotions.CampaignTemplates, { promotionId: promotion.id }),
    [promotion.id]
  )
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
          onShowCampaigns={showCampaignsHandler()}
          promotional={promotion.payload}
          expires={promotion.expires}
          onCreateCampaign={createCampaignHandler}
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
          <CampaignsListEmpty onCreateCampaign={createCampaignHandler} />
        )}
      </Collapsible>
    </>
  )
}
