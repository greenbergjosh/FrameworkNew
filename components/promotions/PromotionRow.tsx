import { Button, Icon, WhiteSpace } from "@ant-design/react-native"
import Item from "@ant-design/react-native/lib/list/ListItem"
import React from "react"
import {
    Image,
    Text,
    TouchableOpacity,
    View
    } from "react-native"
import Collapsible from "react-native-collapsible"
import { TouchableHighlight } from "react-native-gesture-handler"
import { Campaign, Promotion } from "../../api/promotions-services"
import { PromotionsScreenProps } from "../../screens/main/promotions/PromotionsScreen"
import { Empty } from "../Empty"

const DEFAULT_IMAGE = "https://facebook.github.io/react-native/img/tiny_logo.png"

export interface PromotionRowProps {
  campaigns?: Campaign[]
  navigate: PromotionsScreenProps["navigation"]["navigate"]
  onExpand: () => void
  promotion: Promotion
}

export const PromotionRow = ({ navigate, promotion, campaigns, onExpand }: PromotionRowProps) => {
  const [isCollapsed, setCollapsed] = React.useState(true)
  const navigateToCreateCampaign = React.useCallback(
    () => navigate("PromotionsCampaign", { promotionId: promotion.id, draft: true }),
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
      <TouchableOpacity
        onPress={() => {
          onExpand && isCollapsed && onExpand()
          setCollapsed(!isCollapsed)
        }}>
        <View
          style={{
            height: 105,
            paddingLeft: 10,
            marginLeft: 0,
            paddingRight: 10,
            marginRight: 0,
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <View style={{ width: 120, flexDirection: "column", justifyContent: "flex-start" }}>
            <Image
              style={{ width: 90, height: 90 }}
              source={{
                uri:
                  (Array.isArray(promotion.payload.images)
                    ? promotion.payload.images[0]
                    : promotion.payload.images) || DEFAULT_IMAGE,
              }}
            />
          </View>
          <View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}>
            <Text style={{ fontSize: 17 }}>Retailer Name</Text>
            <Text style={{ color: "#707070" }}>{promotion.payload.name}</Text>
            <Text style={{ color: "#707070" }}># active campaign(s)</Text>
            <WhiteSpace />
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Icon name={isCollapsed ? "down" : "up"} color="#C7C7CC" size="xs" />
            </View>
          </View>
          <View style={{ width: 90, flexDirection: "column", justifyContent: "space-between" }}>
            <Text style={{ opacity: promotion.expires ? 0.5 : 0, fontSize: 8 }}>
              Promotion Expires
            </Text>

            <Button onPress={navigateToCreateCampaign} style={{ borderWidth: 0 }}>
              <Icon name="plus" color="#007AFF" size="lg" />
            </Button>
          </View>
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={isCollapsed}>
        <View style={{ backgroundColor: "#F8F8F8EB" }}>
          {campaigns ? (
            <Text>{JSON.stringify(campaigns, null, 2)}</Text>
          ) : (
            <Empty
              message={
                <>
                  <Text>You haven't created any campaigns for this promotion. </Text>
                  <Text style={{ color: "#0000FF" }} onPress={navigateToCreateCampaign}>
                    Create one now?
                  </Text>
                </>
              }
              style={{ paddingTop: 10, paddingBottom: 10 }}
            />
          )}
        </View>
      </Collapsible>
    </Item>
  )
}
