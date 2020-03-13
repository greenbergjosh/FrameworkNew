import React, { ReactElement } from "react"
import { Text, View } from "react-native"
import { Flex } from "@ant-design/react-native"
import { Colors, styles } from "styles"
import Avatar from "components/Avatar"
import TouchText from "components/TouchText"

export interface UserRowProps {
  user: UserType
  renderActions?: () => ReactElement
  onPress?: () => void
}

export const UserRow = ({ user, renderActions, onPress }: UserRowProps) => {
  const { avatarUri, handle, name, userId } = user
  return (
    <View style={styles.ListRow}>
      <Flex
        direction="row"
        align="start"
        justify="start"
        style={{ paddingTop: 5, paddingBottom: 5 }}>
        {/**************************/}
        {/* Avatar */}
        <Flex direction="column" align="start" style={{ marginRight: 10 }}>
          <Avatar source={avatarUri} size="sm" onPress={onPress} />
        </Flex>

        <Flex.Item>
          {/**************************/}
          {/* User Name */}
          <Flex direction="column" align="start" wrap="wrap">
            {onPress ? (
              <TouchText onPress={onPress} labelStyle={{ fontWeight: "bold" }}>
                {handle}
              </TouchText>
            ) : (
              <Text style={{ fontWeight: "bold" }}>{handle}</Text>
            )}

            <Text style={{ color: Colors.bodyTextEmphasis }}>{name}</Text>
          </Flex>
        </Flex.Item>

        {/**************************/}
        {/* Action Buttons */}
        <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
          {renderActions && renderActions()}
        </Flex>
      </Flex>
    </View>
  )
}
