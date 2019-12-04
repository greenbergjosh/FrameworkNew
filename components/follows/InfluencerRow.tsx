import React from "react"
import { Image, Text, TouchableOpacity } from "react-native"
import { Flex, List } from "@ant-design/react-native"
import pupa from "pupa"
import { Influencer } from "api/follows-services/influencers"
import { styles } from "constants"
import moment from "moment"
import Avatar from "components/Avatar"
import TouchText from "../TouchText"

export interface InfluencerRowProps {
  influencer?: Influencer
  navigate
  routes: FeedRoutes
}

const initialCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const InfluencerRow = ({ influencer, navigate, routes }: InfluencerRowProps) => {
  const { avatarUri, statusPhrase, feedImagesSmall, handle, id, lastActivity, userId } = influencer
  return (
    <List.Item>
      <Flex direction="row" align="start" justify="start">
        {/**************************/}
        {/* Avatar */}
        <Flex direction="column" align="start" style={{ marginRight: 10 }}>
          <Avatar
            source={avatarUri}
            size="sm"
            onPress={() =>
              navigate(routes.Feed, {
                userId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
              })
            }
          />
        </Flex>

        <Flex.Item>
          {/**************************/}
          {/* Status Message */}
          <Flex direction="row" wrap="wrap" style={{ marginTop: 5 }}>
            <TouchText
              onPress={() =>
                navigate(routes.Feed, {
                  userId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
                })
              }
              inline
              labelStyle={{ fontWeight: "bold" }}>
              {handle + " "}
            </TouchText>
            <Text>{pupa(statusPhrase.template, statusPhrase.data || [])} </Text>
            <Text style={styles.SmallCopy}>
              {initialCase(moment.utc(lastActivity).fromNow(true))}
            </Text>
          </Flex>

          {/**************************/}
          {/* Feed Images */}
          <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
            {feedImagesSmall.map((feedImage, index) => (
              <TouchableOpacity
                onPress={() =>
                  navigate(routes.FeedDetails, {
                    postId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
                  })
                }
                key={index}>
                <Image
                  source={{ uri: feedImage }}
                  style={[styles.ThumbnailSM, { marginRight: 4, marginBottom: 4 }]}
                />
              </TouchableOpacity>
            ))}
          </Flex>
        </Flex.Item>
      </Flex>
    </List.Item>
  )
}
