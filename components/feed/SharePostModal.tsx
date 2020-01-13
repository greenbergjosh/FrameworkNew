import { View } from "react-native"
import { ActivityIndicator, Modal, WhiteSpace } from "@ant-design/react-native"
import { Colors, Units } from "constants"
import TouchIcon from "components/TouchIcon"
import React from "react"
import { useFollowsContext } from "providers/follows-context-provider"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { SharePost } from "./SharePost"
import { PostToFeed } from "./PostToFeed"

interface SharePostModalProps {
  visible: boolean
  onClose: () => void
}

export const SharePostModal = ({ visible, onClose }: SharePostModalProps) => {
  const [isPost, setIsPost] = React.useState(false)
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
      popup={true}
      visible={visible}
      onClose={onClose}
      animationType="slide-up"
      closable={true}>
      <View
        style={{
          padding: Units.margin,
          paddingTop: Units.margin * 2,
          backgroundColor: Colors.reverse,
          position: "relative",
        }}>
        <TouchIcon
          name="close"
          onPress={onClose}
          style={{ position: "absolute", top: Units.margin, right: Units.margin }}
        />
        {isPost ? (
          <PostToFeed onClose={onClose} />
        ) : (
          <SharePost followers={followers} onPost={() => setIsPost(true)} onClose={onClose} />
        )}
        <WhiteSpace size="xl" />
      </View>
    </Modal>
  )
}
