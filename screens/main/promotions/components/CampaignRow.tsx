import { Flex } from "@ant-design/react-native"
import moment from "moment"
import React from "react"
import { Text, TouchableOpacity } from "react-native"
import { Campaign } from "data/api/promotions.services"
import { PromotionsScreenProps } from "screens/main/promotions/PromotionsScreen"
import { Colors, FontWeights, routes, styles, Units } from "constants"
import { ImageThumbnail } from "components/ImageThumbnail"
import { fixDataImageEncoding } from "data/contextProviders/promotions.contextProvider"
import TouchIcon from "components/TouchIcon"
import { A, SMALL } from "components/Markup"

export interface CampaignRowProps {
  campaign: Campaign
  navigate: PromotionsScreenProps["navigation"]["navigate"]
}

export const CampaignRow = ({ navigate, campaign }: CampaignRowProps) => {
  const isDraft = React.useMemo(() => !campaign.send_date, [campaign.send_date])
  const navigateToCampaign = React.useCallback(
    () =>
      navigate(routes.Promotions.Campaign, {
        promotionId: campaign.promotionId,
        campaignId: campaign.id,
        isDraft,
      }),
    [campaign.promotionId]
  )

  return (
    <TouchableOpacity
      onPress={navigateToCampaign}
      style={{
        display: "flex",
        flexDirection: "row",
        paddingLeft: Units.margin,
        paddingRight: Units.margin,
        paddingTop: Units.padding,
        paddingBottom: Units.padding,
        backgroundColor: isDraft ? Colors.highlight : Colors.childBackground,
      }}>
      {/*******************************
       * Thumbnail
       */}
      <Flex align="start" style={{ marginRight: Units.padding }}>
        <ImageThumbnail size="sm" image={fixDataImageEncoding(campaign.feedImage)} />
      </Flex>
      <Flex direction="column" align="start" style={{ flexGrow: 1, flexShrink: 1 }}>
        {/*******************************
         * Title and Status
         */}
        <Flex
          direction="row"
          justify="between"
          align="start"
          style={{ flexGrow: 1, marginBottom: Units.padding / 2 }}>
          <Flex.Item>
            <Text
              style={[styles.Body, { color: Colors.bodyTextEmphasis }]}
              ellipsizeMode="tail"
              numberOfLines={2}>
              {campaign.subject}
            </Text>
          </Flex.Item>
          <Flex style={{ marginLeft: Units.margin }}>
            {isDraft ? (
              <A style={{ fontWeight: FontWeights.bold }}>DRAFT</A>
            ) : (
              <SMALL style={{ color: Colors.bodyTextEmphasis }}>
                {moment(campaign.created).format("MM-DD-YYYY")}
              </SMALL>
            )}
            <TouchIcon
              name="right"
              size="xs"
              iconStyle={{
                color: isDraft ? Colors.link : Colors.navBarText,
                marginLeft: Units.padding,
              }}
            />
          </Flex>
        </Flex>
        {/*******************************
         * Message and Type Icon
         */}
        <Flex direction="row" align="stretch" style={{ flexGrow: 1 }}>
          <Flex.Item>
            <Text
              style={[styles.Body, { alignItems: "flex-start" }]}
              ellipsizeMode="tail"
              numberOfLines={4}>
              {campaign.templateParts.message || "No message"}
            </Text>
          </Flex.Item>
          <Flex style={{ marginLeft: Units.margin, alignItems: "flex-end" }}>
            <TouchIcon
              name="tag"
              size="md"
              iconStyle={{ color: Colors.navBarText }}
            />
          </Flex>
        </Flex>
      </Flex>
    </TouchableOpacity>
  )
}
