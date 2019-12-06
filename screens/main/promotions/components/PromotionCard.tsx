import { Text, TouchableOpacity, View } from "react-native"
import { PromotionThumb } from "./PromotionThumb"
import { Button, Icon, WhiteSpace } from "@ant-design/react-native"
import React from "react"

export function PromotionCard(props: {
  alwaysExpanded: any
  loading: any
  onPress: () => void
  payload: any
  collapsed: boolean
  expires: ISO8601String | null
  onPress1: () => any
}) {
  return (
    <TouchableOpacity disabled={props.alwaysExpanded || props.loading} onPress={props.onPress}>
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
          <PromotionThumb payload={props.payload} />
        </View>
        <View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}>
          <Text style={{ fontSize: 17 }}>Retailer Name</Text>
          <Text style={{ color: "#707070" }}>{props.payload.name}</Text>
          <Text style={{ color: "#707070" }}># active campaign(s)</Text>
          <WhiteSpace />
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            {!props.alwaysExpanded && (
              <Icon name={props.collapsed ? "down" : "up"} color="#C7C7CC" size="xs" />
            )}
          </View>
        </View>
        <View style={{ width: 90, flexDirection: "column", justifyContent: "space-between" }}>
          <Text style={{ opacity: props.expires ? 0.5 : 0, fontSize: 8 }}>Promotion Expires</Text>

          <Button onPress={props.onPress1} style={{ borderWidth: 0 }}>
            <Icon name="plus" color="#007AFF" size="lg" />
          </Button>
        </View>
      </View>
    </TouchableOpacity>
  )
}
