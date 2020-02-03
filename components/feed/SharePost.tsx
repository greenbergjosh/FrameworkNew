import { FollowersType } from "data/api/follows"
import {
  FlatList,
  Keyboard,
  ScrollView,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Colors, devBorder, ImageUris, styles, Units } from "constants"
import { Button, Checkbox, Flex, SearchBar, WhiteSpace } from "@ant-design/react-native"
import Avatar from "../Avatar"
import TouchIcon from "../TouchIcon"
import React from "react"
import { UserRow } from "../UserRow"
import { Empty } from "../Empty"
import { KeyboardAccessoryView } from "react-native-keyboard-accessory"

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
            <Avatar source={ImageUris.placeholder} size="sm" />
          </Flex>
          <Flex.Item>
            <Text style={{ color: Colors.bodyText }}>Add this post to your feed</Text>
          </Flex.Item>
          <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
            <TouchIcon name="right" />
          </Flex>
        </Flex>
      </TouchableOpacity>
    </View>
  )
}

interface SharePostProps {
  followers: FollowersType
  onClose: () => void
  onPost: () => void
  style?: StyleProp<ViewStyle>
}

export function SharePost({ followers, onClose, onPost, style }: SharePostProps) {
  const searchRef = React.useRef<SearchBar>()
  const [searchTerms, setSearchTerms] = React.useState(null)
  const [showKeyboard, setShowKeyboard] = React.useState(false)

  // Will mount add listeners
  const { keyboardWillShowListener, keyboardWillHideListener } = React.useMemo(() => {
    const keyboardWillShowListener = Keyboard.addListener("keyboardWillShow", (e) => {
      setShowKeyboard(true)
    })
    const keyboardWillHideListener = Keyboard.addListener("keyboardWillHide", (e) => {
      setShowKeyboard(false)
    })
    return {
      keyboardWillShowListener,
      keyboardWillHideListener,
    }
  }, [])

  // Unmount cleanup listeners
  React.useEffect(() => {
    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [])

  return (
    <View style={style}>
      {showKeyboard ? <ScrollView /> : null}
      <KeyboardAccessoryView
        alwaysVisible
        hideBorder
        style={{ backgroundColor: Colors.reverse, borderWidth: 0 }}>
        <WhiteSpace size="sm" />
        <SearchBar
          ref={searchRef}
          value={searchTerms}
          placeholder="Search contacts"
          cancelText="Cancel"
          showCancelButton={false}
          onCancel={Keyboard.dismiss}
          onSubmit={() => alert("Search feature to come!")}
        />
        <PostToFeedButton onPost={onPost} />
        <FlatList
          data={followers.followers}
          keyExtractor={(follower) => follower.id}
          renderItem={({ item }) => (
            <UserRow
              key={item.userId}
              user={item}
              renderActions={() => <Checkbox checked={false} onChange={(e) => {}} />}
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
      </KeyboardAccessoryView>
    </View>
  )
}
