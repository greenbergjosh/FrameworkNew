import { FlatList, Modal, View } from "react-native"
import { ActivityIndicator, Button, Checkbox, WhiteSpace } from "@ant-design/react-native"
import { Colors, Units } from "constants"
import { P } from "../Markup"
import TouchIcon from "../TouchIcon"
import React from "react"
import { UserRow } from "components/UserRow"
import { Empty } from "components/Empty"
import { useFollowsContext } from "providers/follows-context-provider"
import { NavigationTabScreenProps } from "react-navigation-tabs"

interface PostShareProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  visible: boolean
  onClose: () => void
}

export const PostShareModal = ({ visible, onClose, navigate }: PostShareProps) => {
  const followsContext = useFollowsContext()
  if (
    !followsContext.lastLoadFollowers &&
    !followsContext.loading.loadFollowers[JSON.stringify([])]
  ) {
    followsContext.loadFollowers()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const followers = followsContext.followers

  return (
    <Modal
      presentationStyle="formSheet"
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}>
      <View
        style={{
          padding: Units.margin,
          backgroundColor: Colors.reverse,
          position: "relative",
        }}>
        <TouchIcon
          name="close"
          onPress={onClose}
          style={{ position: "absolute", top: Units.margin, right: Units.margin }}
        />
        <P>Add post to your story &gt;</P>
        <FlatList
          data={followers.followers}
          keyExtractor={(follower) => follower.id}
          renderItem={({ item }) => (
            <UserRow
              key={item.userId}
              user={item}
              renderActions={() => (
                <Checkbox checked={false} onChange={(e) => {}} />
              )}
            />
          )}
          ListEmptyComponent={
            <Empty message="You have no followers" style={{ padding: Units.margin }} />
          }
        />
        <WhiteSpace size="xl" />
        <Button
          type="primary"
          onPress={() => {
            // TODO: api call to send post
            onClose()
          }}>
          Send
        </Button>
      </View>
    </Modal>
  )
}
