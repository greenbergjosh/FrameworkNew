import React from "react"
import Avatar from "components/Avatar"
import { TouchableOpacity, View } from "react-native"
import { Colors, Units } from "../constants/unit.constants"
import { styles } from "constants"

interface AvatarClusterProps {
  users: UserType[]
  onPress?: () => void
}

export default function AvatarCluster({ users, onPress }: AvatarClusterProps) {
  return (
    <TouchableOpacity onPress={onPress} style={{ position: "relative" }}>
      {users.map((user, idx) =>
        idx === 0 ? (
          <Avatar key={user.userId + idx} source={user.avatarUri} size="sm" />
        ) : (
          <View
            key={user.userId + idx}
            style={{
              position: "absolute",
              top: 0,
              left: Units.padding,
              borderWidth: 1,
              borderColor: Colors.reverse,
              borderRadius: (styles.AvatarSM.height / 2)
            }}>
            <Avatar source={user.avatarUri} size="sm" />
          </View>
        )
      )}
    </TouchableOpacity>
  )
}
