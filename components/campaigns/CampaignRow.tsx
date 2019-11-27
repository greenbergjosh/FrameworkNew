import { Button, Icon, WhiteSpace } from "@ant-design/react-native"
import Item from "@ant-design/react-native/lib/list/ListItem"
import moment from "moment"
import React from "react"
import {
  Image,
  Text,
  TouchableOpacity,
  View
  } from "react-native"
import Collapsible from "react-native-collapsible"
import { TouchableHighlight } from "react-native-gesture-handler"
import { Campaign, Promotion } from "api/promotions-services"
import { PromotionsScreenProps } from "screens/main/promotions/PromotionsScreen"
import { Empty } from "../Empty"

const DEFAULT_IMAGE = "https://facebook.github.io/react-native/img/tiny_logo.png"

export interface CampaignRowProps {
  campaign: Campaign
  navigate: PromotionsScreenProps["navigation"]["navigate"]
  promotion: Promotion
}

export const CampaignRow = ({ navigate, promotion, campaign }: CampaignRowProps) => {
  const navigateToCampaign = React.useCallback(
    () => navigate("PromotionsCampaign", { promotionId: promotion.id, campaignId: campaign.id }),
    [promotion.id]
  )
  return (
    <Item
      wrap
      // arrow={null}
      // extra={null}
      // style={{
      //   padding: 0,
      //   paddingLeft: 0,
      //   paddingRight: 0,
      //   paddingBottom: 0,
      // }}
      // styles={{
      //   underlayColor: { backgroundColor: "transparent" },
      //   Line: { paddingRight: 0 },
      // }}
    >
      <TouchableOpacity onPress={navigateToCampaign}>
        <View
          style={{
            paddingLeft: 10,
            marginLeft: 0,
            paddingRight: 10,
            marginRight: 0,
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <View style={{ width: 65, flexDirection: "column", justifyContent: "flex-start" }}>
            <Image
              style={{ width: 60, height: 60 }}
              source={{
                uri: fixDataImageEncoding(campaign.feedImage) || DEFAULT_IMAGE,
              }}
            />
          </View>
          <View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}>
            <Text style={{ fontSize: 17 }}>{campaign.subject}</Text>
            <Text style={{ fontSize: 15 }}>{campaign.templateParts.message}</Text>
          </View>
          <View style={{ width: 90, flexDirection: "column", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 12 }}>{moment(campaign.created).calendar()}</Text>
            <WhiteSpace />
          </View>
        </View>
      </TouchableOpacity>
    </Item>
  )
}

// If something has damaged the encoding, we can try to fix it
const fixDataImageEncoding = (base64Image: string) =>
  base64Image.startsWith("data:image")
    ? base64Image
    : base64Image[0] === "i"
    ? `data:image/png;base64,${base64Image}`
    : base64Image[0] === "R"
    ? `data:image/gif;base64,${base64Image}`
    : base64Image[0] === "/"
    ? `data:image/jpg;base64,${base64Image}`
    : base64Image
