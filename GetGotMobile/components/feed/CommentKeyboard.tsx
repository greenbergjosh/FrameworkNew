import { Keyboard, TextInput, TouchableWithoutFeedback, View } from "react-native"
import { Colors, Units } from "styles"
import React from "react"
import { KeyboardAccessoryView } from "react-native-keyboard-accessory"
import TouchText from "../TouchText"

interface PostToFeedProps {
  visible: boolean
  onClose: () => void
  accomodateTabNavigation: boolean
}

export const CommentKeyboard = ({ visible, onClose, accomodateTabNavigation }: PostToFeedProps) => {
  const [message, setMessage] = React.useState(null)
  const [keyboardShown, setKeyboardShown] = React.useState(false)
  const inputRef = React.useRef<TextInput>()

  React.useEffect(() => {
    visible ? inputRef.current.focus() : null
  }, [visible])

  // Component will mount: add listeners
  const { keyboardWillHideListener, keyboardWillShowListener } = React.useMemo(() => {
    const keyboardWillShowListener = Keyboard.addListener("keyboardWillShow", (e) => {
      setKeyboardShown(true)
    })
    const keyboardWillHideListener = Keyboard.addListener("keyboardWillHide", (e) => {
      setKeyboardShown(false)
      onClose()
    })
    return {
      keyboardWillHideListener,
      keyboardWillShowListener,
    }
  }, [])

  // Unmount: remove listeners
  React.useEffect(() => {
    return () => {
      keyboardWillHideListener.remove()
      keyboardWillShowListener.remove()
    }
  }, [])

  return (
    <>
      <KeyboardAccessoryView
        alwaysVisible
        style={{
          backgroundColor: Colors.navBarBackground,
          marginBottom: accomodateTabNavigation && keyboardShown ? -(Units.padding * 2) : 0,
        }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              paddingTop: Units.padding,
              paddingLeft: Units.margin,
              paddingRight: Units.margin,
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
            }}>
            <TextInput
              ref={inputRef}
              placeholder="Add a comment"
              style={{
                borderColor: Colors.border,
                borderWidth: 1,
                padding: Units.padding,
                height: 45,
                flexGrow: 1,
                marginRight: Units.padding,
              }}
              multiline={true}
              numberOfLines={4}
              onChangeText={(text) => setMessage(text)}
              value={message}
            />
            <TouchText
              onPress={() => {
                // TODO: api call to send comment
                Keyboard.dismiss()
              }}>
              Post
            </TouchText>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAccessoryView>
    </>
  )
}
