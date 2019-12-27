import React from "react"
import { Flex } from "@ant-design/react-native"
import { Units } from "constants"
import { TouchableOpacity } from "react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { H4 } from "components/Markup"
import { UserInfoChildProps } from "./user-info-types"

export interface UserInfoShortProps extends UserInfoChildProps {
  user: UserType
  campaignId?: GUID
}

/**
 * Small User Info layout
 * @param user
 * @param navigate
 * @param routes
 * @param isCurrentUser
 * @param onPostActionsPress
 * @constructor
 */
export const UserInfoShort = ({
  user,
  navigate,
  routes,
  isCurrentUser,
  onPostActionsPress,
}: UserInfoShortProps) => (
  <Flex direction="row" style={{ margin: Units.margin }} justify="between">
    <Flex>
      <Avatar
        source={user.avatarUri}
        size="sm"
        onPress={() => navigate(routes.Feed, { userId: user.userId })}
      />
      <TouchableOpacity onPress={() => navigate(routes.Feed, { userId: user.userId })}>
        <H4 style={{ marginLeft: Units.margin / 2 }}>{user.handle}</H4>
      </TouchableOpacity>
    </Flex>
    <TouchIcon name="ellipsis" size="lg" onPress={onPostActionsPress} />
  </Flex>
)
