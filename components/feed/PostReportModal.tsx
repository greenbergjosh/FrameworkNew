import { FlatList, Modal, View } from "react-native"
import { Button, Radio, WhiteSpace } from "@ant-design/react-native"
import { Colors, Units } from "constants"
import { H2 } from "../Markup"
import TouchIcon from "../TouchIcon"
import React from "react"

interface PostModalProps {
  visible: boolean
  onClose: () => void
}

export const PostReportModal = ({ visible, onClose }: PostModalProps) => {
  const [reasonCode, setReasonCode] = React.useState(null)
  type ReasonType = {
    id: GUID
    description: string
  }
  const reasons: ReasonType[] = [
    { id: "3957dc34-f221-42bc-b28b-675d8af11b27", description: "Pornography" },
    { id: "3957dc34-f221-42bc-b28b-675d8af11b26", description: "Violence" },
    { id: "3957dc34-f221-42bc-b28b-675d8af11b25", description: "Advocates criminal behaviour" },
    { id: "3957dc34-f221-42bc-b28b-675d8af11b24", description: "Offensive content" },
    { id: "3957dc34-f221-42bc-b28b-675d8af11b23", description: "Promotes racism or hate" },
    { id: "3957dc34-f221-42bc-b28b-675d8af11b22", description: "Other" },
  ]

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
          paddingTop: Units.margin * 2,
          backgroundColor: Colors.reverse,
          position: "relative",
        }}>
        <TouchIcon
          name="close"
          onPress={onClose}
          style={{ position: "absolute", top: Units.margin, right: Units.margin }}
        />
        <H2>Report Inappropriate</H2>
        <WhiteSpace size="xl" />
        <FlatList
          data={reasons}
          keyExtractor={(reason) => reason.id}
          renderItem={({ item }) => (
            <Radio.RadioItem
              checked={reasonCode === item.id}
              onChange={(event: any) => {
                if (event.target.checked) {
                  setReasonCode(item.id)
                }
              }}>
              {item.description}
            </Radio.RadioItem>
          )}
        />
        <WhiteSpace size="xl" />
        <WhiteSpace size="xl" />
        <Button
          type="primary"
          onPress={() => {
            // TODO: api call to send reason
            onClose()
          }}>
          Send Report
        </Button>
      </View>
    </Modal>
  )
}
