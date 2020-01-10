import React from "react"
import { Text } from "react-native"
import { Checkbox, Flex, List } from "@ant-design/react-native"
import { Contact } from "api/messages-services"
import { styles, Units } from "constants"
import Avatar from "components/Avatar"

export interface ContactRowProps {
  contact?: Contact
}

export const ContactRow = ({ contact }: ContactRowProps) => {
  const { id, userId, avatarUri, handle, name, contactDate, content } = contact
  const [checked, setChecked] = React.useState(false)

  return (
    <List.Item key={contact.id} onPress={() => setChecked(!checked)}>
      <Flex direction="row" style={{ marginTop: 5 }}>
        <Flex direction="column" align="start" style={{ marginRight: 10 }}>
          <Avatar source={avatarUri} size="md" />
        </Flex>
        <Flex direction="column" align="start" style={{ flexShrink: 1, marginRight: Units.margin }}>
          <Text style={{ fontWeight: "bold" }}>{handle}</Text>
          <Text style={styles.Body}>{name}</Text>
        </Flex>
        <Flex direction="row" justify="end" align="center" wrap="wrap" style={{ flexGrow: 1 }}>
          <Checkbox checked={checked} onChange={(e) => {}} />
        </Flex>
      </Flex>
    </List.Item>
  )
}
