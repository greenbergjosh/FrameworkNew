import { FlatList, View } from "react-native"
import { Button, Radio, WhiteSpace, Modal } from "@ant-design/react-native"
import { Colors, Units } from "constants"
import { H2, P } from "../Markup"
import TouchIcon from "../TouchIcon"
import React from "react"

interface ReportPostModalProps {
  visible: boolean
  onClose: () => void
  user: UserType
}

export const ReportPostModal = ({ visible, onClose, user }: ReportPostModalProps) => {
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
        <H2>Report Inappropriate</H2>
        <WhiteSpace size="xl" />
        <P>Report {user.handle}'s post for:</P>
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
        <Button
          type="primary"
          onPress={() => {
            // TODO: api call to send reason
            onClose()
          }}>
          Send Report
        </Button>
        <WhiteSpace size="xl" />
      </View>
    </Modal>
  )
}
