import { Text, View } from "react-native"
import { ImageThumbnail } from "components/ImageThumbnail"
import { ActionSheet, Flex, Icon, SwipeAction } from "@ant-design/react-native"
import { Colors, devBorder, styles, Units, routes } from "constants"
import React from "react"
import { H3, SMALL } from "components/Markup"
import TouchIcon from "components/TouchIcon"
import { Promotional } from "api/promotions-services"
import { UndoIcon } from "assets/icons"

interface PromotionCardProps {
  onShowCampaigns: () => void
  onCreateCampaign: () => void
  promotional: Promotional
  expires: ISO8601String | null
  isArchived: boolean
}

export function PromotionCard({
  onShowCampaigns,
  onCreateCampaign,
  expires,
  promotional,
  isArchived,
}: PromotionCardProps) {
  const swipeMenuArchive = [
    {
      text: (
        <>
          <Icon name="delete" color={Colors.reverse} />
          <Text style={[styles.Body, { color: Colors.reverse }]}>Archive</Text>
        </>
      ),
      onPress: () => alert("Archive Promotion\nFeature to come!"),
      style: { backgroundColor: Colors.archived, color: "white" },
    },
  ]
  const swipeMenuUnarchive = [
    {
      text: (
        <>
          <UndoIcon style={{ color: Colors.reverse }} />
          <Text style={[styles.Body, { color: Colors.reverse }]}>Unarchive</Text>
        </>
      ),
      onPress: () => alert("Unarchive Promotion\nFeature to come!"),
      style: { backgroundColor: Colors.success, color: "white" },
    },
  ]
  const swipeMenu = isArchived ? swipeMenuUnarchive : swipeMenuArchive

  return (
    <SwipeAction style={{ backgroundColor: "transparent", width: "100%" }} right={swipeMenu}>
      <Flex
        direction="row"
        align="start"
        onPress={onShowCampaigns}
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
            {!expires ? (
              <Flex direction="column" align="end" style={{ paddingLeft: Units.padding }}>
                <Text style={styles.TinyCopy}>Promotion Expires</Text>
                <Text style={styles.TinyCopy}>MM-DD-YYYY</Text>
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
                  <Text style={{ color: Colors.bodyTextEmphasis }}>#</Text> active campaign(s)
                </SMALL>
              </View>
            </Flex>
            <Flex
              direction="column"
              justify="end"
              style={{
                right: -Units.padding,
                bottom: -4,
              }}>
              <TouchIcon
                name="plus"
                onPress={onCreateCampaign}
                size="lg"
                iconStyle={{ color: Colors.link }}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </SwipeAction>
  )
}
