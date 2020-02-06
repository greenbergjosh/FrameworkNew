import { Modal, TextareaItem } from "@ant-design/react-native"
import React from "react"
import { View } from "react-native"

interface TextAreaModalProps {
  initialValue?: string
  onCancel: () => void
  onOK: (message: string) => void
  placeholder?: string
  title?: string
  visible?: boolean
}

export const TextAreaModal = ({
  initialValue,
  onCancel,
  onOK,
  placeholder = "Enter your message...",
  title,
  visible,
}: TextAreaModalProps) => {
  const [text, setText] = React.useState(initialValue)
  return (
    <Modal
      title={title}
      transparent
      onClose={onCancel}
      maskClosable
      visible={visible}
      closable
      footer={[{ text: "Cancel", onPress: onCancel }, { text: "Save", onPress: () => onOK(text) }]}>
      <View style={{ paddingVertical: 20 }}>
        <TextareaItem
          count={200}
          onChangeText={setText}
          placeholder={placeholder}
          rows={4}
          value={text}
        />
      </View>
    </Modal>
  )
}
