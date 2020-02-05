import {
  KeyboardAvoidingView,
  ScrollView,
  StyleProp,
  TextInput,
  View,
  ViewStyle,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native"
import { Button, SearchBar, WhiteSpace } from "@ant-design/react-native"
import { Colors, Units } from "constants"
import React from "react"
import { H4 } from "../Markup"
import { KeyboardAccessoryView } from "react-native-keyboard-accessory"

interface PostToFeedProps {
  onClose: () => void
  style?: StyleProp<ViewStyle>
}

export const PostToFeed = ({ onClose, style }: PostToFeedProps) => {
  const [message, setMessage] = React.useState(null)
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              paddingLeft: Units.margin,
              paddingRight: Units.margin,
            }}>
            <H4>Post this message to your feed</H4>
            <TextInput
              placeholder="Enter your message"
              style={{
                borderColor: Colors.border,
                borderWidth: 1,
                padding: Units.padding,
                height: 100,
                marginTop: Units.padding,
                marginBottom: Units.padding,
              }}
              multiline={true}
              numberOfLines={4}
              onChangeText={(text) => setMessage(text)}
              value={message}
            />
            <Button
              type="primary"
              onPress={() => {
                // TODO: api call to send post
                onClose()
              }}>
              Post
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAccessoryView>
    </View>
  )
}
