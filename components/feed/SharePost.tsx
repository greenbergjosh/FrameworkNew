import { Followers } from "../../api/follows-services"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import { Colors, ImageUris, styles, Units } from "constants"
import { Button, Checkbox, Flex, SearchBar, WhiteSpace } from "@ant-design/react-native"
import Avatar from "../Avatar"
import TouchIcon from "../TouchIcon"
import React from "react"
import { UserRow } from "../UserRow"
import { Empty } from "../Empty"

export interface PostToFeedButtonProps {
  onPost?: () => void
}

export const PostToFeedButton = ({ onPost }: PostToFeedButtonProps) => {
  return (
    <View style={styles.ListRow}>
      <TouchableOpacity onPress={onPost}>
        <Flex
          direction="row"
          align="center"
          justify="start"
          style={{ paddingTop: 5, paddingBottom: 5 }}>
          <Flex direction="column" align="start" style={{ marginRight: 10 }}>
            <Avatar source={ImageUris.placeholder} size="sm"/>
          </Flex>
          <Flex.Item>
            <Text style={{ color: Colors.bodyText }}>Add this post to your feed</Text>
          </Flex.Item>
          <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
            <TouchIcon name="right"/>
          </Flex>
        </Flex>
      </TouchableOpacity>
    </View>
  )
}

interface SharePostProps {
  followers: Followers
  onClose: () => void
  onPost: () => void
}

export function SharePost({ followers, onClose, onPost }: SharePostProps) {
  return (
    <>
      <WhiteSpace size="lg"/>
      <SearchBar
        placeholder="Search contacts"
        cancelText="Cancel"
        showCancelButton={false}
        onSubmit={() => alert("Search feature to come!")}
      />
      <PostToFeedButton onPost={onPost}/>
      <FlatList
        data={followers.followers}
        keyExtractor={(follower) => follower.id}
        renderItem={({ item }) => (
          <UserRow
            key={item.userId}
            user={item}
            renderActions={() => <Checkbox checked={false} onChange={(e) => {
            }}/>}
          />
        )}
        ListEmptyComponent={
          <Empty message="You have no followers" style={{ padding: Units.margin }}/>
        }
      />
      <WhiteSpace size="xl"/>
      <Button
        type="primary"
        onPress={() => {
          // TODO: api call to send post
          onClose()
        }}>
        Send
      </Button>
    </>
  )
}