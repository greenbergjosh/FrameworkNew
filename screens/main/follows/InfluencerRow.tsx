import React from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native"
import { Flex, List } from "@ant-design/react-native"
import pupa from "pupa"
import { Influencer, follows } from "api/follows-services"
import { FollowsScreenProps } from "./FollowsScreen"
import { styles } from "constants"
import moment from "moment"

export interface InfluencerRowProps {
  influencer?: Influencer
  navigate: FollowsScreenProps["navigation"]["navigate"]
}

const initialCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
const influencerPressHandler = () => alert("Feature to come: navigate to influencer's feed")
const feedPressHandler = () => alert("Feature to come: navigate to influencer's post")

export const InfluencerRow = ({ influencer }: InfluencerRowProps) => {
  const { avatarUri, statusPhrase, feedImagesSmall, handle, id, timeStamp, userId } = influencer
  return (
    <List.Item>
      <Flex direction="row" align="start" justify="start">
        {/**************************/}
        {/* Avatar */}
        <Flex direction="column" align="start" style={{ marginRight: 10 }}>
          <TouchableOpacity onPress={influencerPressHandler}>
            <Image source={{ uri: avatarUri }} style={styles.AvatarSM} />
          </TouchableOpacity>
        </Flex>

        <Flex.Item>
          {/**************************/}
          {/* Status Message */}
          <Flex direction="row" wrap="wrap" style={{ marginTop: 5 }}>
            <TouchableOpacity onPress={influencerPressHandler}>
              <Text style={[styles.LinkText, { fontWeight: "bold" }]}>{handle} </Text>
            </TouchableOpacity>
            <Text>{pupa(statusPhrase.template, statusPhrase.data || [])} </Text>
            <Text style={styles.SmallCopy}>{initialCase(moment(timeStamp).fromNow(true))}</Text>
          </Flex>

          {/**************************/}
          {/* Feed Images */}
          <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
            {feedImagesSmall.map((feedImage, index) => (
              <TouchableOpacity onPress={feedPressHandler} key={index}>
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
