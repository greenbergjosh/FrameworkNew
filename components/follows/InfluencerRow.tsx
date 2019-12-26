import React from "react"
import { Text } from "react-native"
import { Button, Flex, List } from "@ant-design/react-native"
import pupa from "pupa"
import { Influencer } from "api/follows-services"
import { Units } from "constants"
import moment from "moment"
import Avatar from "components/Avatar"
import TouchText from "../TouchText"
import { SMALL } from "components/Markup"
import TouchImage from "../TouchImage"

export interface InfluencerRowProps {
  influencer?: Influencer
  navigate
  routes: FeedRoutesType
  isRecommended?: boolean
}

const initialCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const InfluencerRow = ({
  influencer,
  navigate,
  routes,
  isRecommended = false,
}: InfluencerRowProps) => {
  const { avatarUri, statusPhrase, feed, handle, id, lastActivity, userId } = influencer
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
          <Flex
            direction="row"
            wrap="nowrap"
            align="start"
            justify="start"
            style={{ marginTop: Units.padding / 2 }}>
            <Flex direction="row" wrap="wrap" style={{ flexShrink: 1 }}>
              <TouchText
                onPress={() =>
                  navigate(routes.Feed, {
                    userId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
                  })
                }
                labelStyle={{ fontWeight: "bold" }}>
                {handle + " "}
              </TouchText>
              <Text>
                {pupa(statusPhrase.template, statusPhrase.data || [])}{" "}
                <SMALL>{initialCase(moment.utc(lastActivity).fromNow(true))}</SMALL>
              </Text>
            </Flex>
            {isRecommended ? (
              <Flex
                direction="row"
                justify="end"
                style={{ flexGrow: 1, paddingLeft: Units.padding }}>
                <Button size="small" type="primary">
                  Follow
                </Button>
              </Flex>
            ) : null}
          </Flex>

          {/**************************/}
          {/* Feed Images */}
          <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
            {feed.map((post, index) => (
              <TouchImage
                key={index}
                uri={post.image.source.uri}
                size="img40"
                onPress={() =>
                  navigate(routes.FeedDetails, {
                    postId: post.id,
                  })
                }
                style={{ marginRight: 4, marginBottom: 4 }}
              />
            ))}
          </Flex>
        </Flex.Item>
      </Flex>
    </List.Item>
  )
}
