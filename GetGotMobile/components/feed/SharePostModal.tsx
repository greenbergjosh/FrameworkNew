import { Animated, Dimensions, StyleProp, ViewStyle } from "react-native"
import { ActivityIndicator, Modal, WhiteSpace } from "@ant-design/react-native"
import { Units } from "styles"
import TouchIcon from "components/TouchIcon"
import React from "react"
import { useFollowsContext } from "data/contextProviders/follows.contextProvider"
import { SharePost } from "./SharePost"
import { PostToFeed } from "./PostToFeed"
import { FollowersType } from "data/api/follows"

interface SharePostModalProps {
  visible: boolean
  onClose: () => void
}

function getScreenWidth() {
  return Dimensions.get("window").width
}

export const SharePostModal = ({ visible, onClose }: SharePostModalProps) => {
  const animatedLeftMargin = new Animated.Value(0)
  const [slidePanelWidthStyle, setSlidePanelWidthStyle] = React.useState<StyleProp<ViewStyle>>({})
  const [childPanelWidthStyle, setChildPanelStyle] = React.useState<StyleProp<ViewStyle>>({})
  const [leftMargin, setLeftMargin] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [followers, setFollowers] = React.useState<FollowersType>()
  const followsContext = useFollowsContext()

  React.useEffect(() => {
    const screenWidth = getScreenWidth()
    setSlidePanelWidthStyle({ width: screenWidth * 2 })
    setChildPanelStyle({ width: screenWidth })
  }, [])

  React.useEffect(() => {
    Animated.timing(animatedLeftMargin, {
      toValue: leftMargin,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [leftMargin])

  const togglePanel = () => {
    const newLeftMargin = getScreenWidth() * -1
    leftMargin === 0 ? setLeftMargin(newLeftMargin) : setLeftMargin(0)
  }

  React.useEffect(() => {
    if (
      !followsContext.lastLoadFollowers &&
      !followsContext.loading.loadFollowers[JSON.stringify([])]
    ) {
      setIsLoading(true)
      followsContext.loadFollowers().then(() => {
        setIsLoading(false)
        setFollowers(followsContext.followers)
      })
    }
  }, [useFollowsContext])

  return (
    <Modal
      popup={true}
      visible={visible}
      maskClosable={true}
      onClose={onClose}
      animationType="slide-up"
      onAnimationEnd={() => setLeftMargin(0)}
      closable={true}
      style={{ display: "flex", flexDirection: "column" }}>
      <TouchIcon
        name="close"
        onPress={onClose}
        style={{
          alignSelf: "flex-end",
          marginTop: Units.padding,
          marginRight: Units.padding,
        }}
      />
      <Animated.View
        style={[
          slidePanelWidthStyle,
          {
            marginLeft: animatedLeftMargin,
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
          },
        ]}>
        {isLoading && visible ? (
          <ActivityIndicator animating toast size="large" text="Loading..." />
        ) : (
          <SharePost
            style={childPanelWidthStyle}
            followers={followers}
            onPost={togglePanel}
            onClose={onClose}
          />
        )}

        <PostToFeed style={[childPanelWidthStyle]} onClose={onClose} />
      </Animated.View>
      <WhiteSpace size="xl" />
    </Modal>
  )
}
