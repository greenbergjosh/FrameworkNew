import React from "react"
import { User } from "api/messages-services"
import { Avatar } from "components/Avatar"
import { TouchableOpacity } from "react-native"

interface AvatarClusterProps {
  users: User[]
  onPress?: () => void
}

export default function AvatarCluster({ users, onPress }: AvatarClusterProps) {
  return (
    <TouchableOpacity onPress={onPress} style={{ position: "relative" }}>
      {users.map((user, idx) =>
        idx === 0 ? (
          <Avatar key={user.userId + idx} source={user.avatarUri} size="sm" />
        ) : (
          <Avatar
            key={user.userId + idx}
            source={user.avatarUri}
            size="sm"
            style={{
              position: "absolute",
              top: 3,
              left: 7,
            }}
          />
        )
      )}
    </TouchableOpacity>
  )
}
