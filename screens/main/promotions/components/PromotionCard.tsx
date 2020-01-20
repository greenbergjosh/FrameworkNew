import { Alert, Text, View } from "react-native"
import { ImageThumbnail } from "components/ImageThumbnail"
import { Flex, Icon, SwipeAction } from "@ant-design/react-native"
import { Colors, styles, Units } from "constants"
import React from "react"
import { H3, SMALL } from "components/Markup"
import TouchIcon from "components/TouchIcon"
import { Promotional } from "data/api/promotions.services"
import { showCreateCampaignActionSheet } from "./CreateCampaignActionSheet"
import { pluralize } from "../../../../util"
import moment from "moment"

interface PromotionCardProps {
  onPress?: () => void
  promotional: Promotional
  expires: ISO8601String | null
  isArchived: boolean
  campaignCount: number
  promotionId: GUID
  navigate
}

export function PromotionCard({
  onPress,
  expires,
  promotional,
  isArchived,
  campaignCount,
  promotionId,
  navigate,
}: PromotionCardProps) {
  const swipeMenuDelete = [
    {
      text: (
        <>
          <Icon name="delete" color={Colors.reverse} />
          <Text style={[styles.Body, { color: Colors.reverse }]}>Delete</Text>
        </>
      ),
      onPress: () =>
        Alert.alert(
          "Delete this promotion?",
          `Are you sure you want to permanently remove {Retailer Name} ${promotional.name}?`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => alert("Delete Promotion\nFeature to come!"),
            },
          ]
        ),
      style: { backgroundColor: Colors.warning, color: Colors.reverse },
    },
  ]
  const swipeMenuArchive = [
    {
      text: (
        <>
          <Icon name="delete" color={Colors.reverse} />
          <Text style={[styles.Body, { color: Colors.reverse }]}>Archive</Text>
        </>
      ),
      onPress: () =>
        Alert.alert(
          "Archive this promotion?",
          `Are you sure you want to archive {Retailer Name} ${promotional.name}? 
          Associated campaigns can not be published again.`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => alert("Archive Promotion\nFeature to come!"),
            },
          ]
        ),
      style: { backgroundColor: Colors.archived, color: Colors.reverse },
    },
  ]
  const swipeMenuUnarchive = [
    {
      text: (
        <>
          <TouchIcon name="ios-undo" reverse />
          <Text style={[styles.Body, { color: Colors.reverse }]}>Unarchive</Text>
        </>
      ),
      onPress: () => alert("Unarchive Promotion\nFeature to come!"),
      style: { backgroundColor: Colors.success, color: Colors.reverse },
    },
  ]

  const swipeMenu = React.useMemo(() => {
    const a = campaignCount < 1 ? swipeMenuDelete : swipeMenuArchive
    const b = isArchived ? swipeMenuUnarchive : a
    return b
  }, [campaignCount, isArchived])

  return (
    <SwipeAction style={{ backgroundColor: "transparent", width: "100%" }} right={swipeMenu}>
      <Flex
        direction="row"
        align="start"
        onPress={onPress}
        style={{
          paddingLeft: Units.margin,
          paddingRight: Units.margin,
          paddingTop: Units.margin / 2,
          paddingBottom: Units.margin / 2,
          borderBottomWidth: 1,
          borderColor: Colors.border,
          backgroundColor: Colors.reverse,
        }}>
        {/*******************************
         * Thumbnail
         */}
        <Flex
          direction="column"
          justify="start"
          style={{
            paddingRight: Units.margin,
          }}>
          <ImageThumbnail image={promotional.images} />
        </Flex>

        {/*******************************
         * Promo Info
         */}
        <Flex
          direction="column"
          align="start"
          style={{
            flexGrow: 1,
            flexShrink: 1,
          }}>
          {/*******************************
           * Retailer Name and Expiration
           */}
          <Flex direction="row" justify="between" align="start">
            <Flex.Item>
              <H3 style={{ color: Colors.bodyTextEmphasis }}>Retailer Name</H3>
            </Flex.Item>
            {!!expires ? (
              <Flex direction="column" align="end" style={{ paddingLeft: Units.padding }}>
                <Text style={styles.TinyCopy}>Promotion Expires</Text>
                <Text style={styles.TinyCopy}>{moment(expires).format("MM-DD-YYYY")}</Text>
              </Flex>
            ) : null}
          </Flex>

          {/*******************************
           * Product Name and Campaign Count
           */}
          <Flex
            direction="row"
            align="stretch"
            style={{
              flexGrow: 1,
            }}>
            <Flex
              direction="column"
              align="start"
              style={{
                flexGrow: 1,
                flexShrink: 1,
              }}>
              <View>
                <Text style={styles.Body}>{promotional.name}</Text>
              </View>
              <View>
                <SMALL>
                  <Text style={{ color: Colors.bodyTextEmphasis }}>{campaignCount}</Text> active{" "}
                  {pluralize(campaignCount, "campaign")}
                </SMALL>
              </View>
            </Flex>
            {isArchived ? null : (
              <Flex
                direction="column"
                justify="end"
                style={{
                  right: -Units.padding,
                  bottom: -4,
                }}>
                <TouchIcon
                  name="plus"
                  onPress={() => showCreateCampaignActionSheet(promotionId, navigate)}
                  size="lg"
                  iconStyle={{ color: Colors.link }}
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </SwipeAction>
  )
}
