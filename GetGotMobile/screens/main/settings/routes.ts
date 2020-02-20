import { routes } from "routes"
import { AnalyticsScreen } from "./AnalyticsScreen"
import { BlockedUsersScreen } from "./BlockedUsersScreen"
import { NotificationsScreen } from "./NotificationsScreen"
import { PrivacyOptionsScreen } from "./PrivacyOptionsScreen"

export const settingsRoutes = {
  [routes.Settings.Analytics]: { screen: AnalyticsScreen },
  [routes.Settings.PrivacyOptions]: { screen: PrivacyOptionsScreen },
  [routes.Settings.Notifications]: { screen: NotificationsScreen },
  [routes.Settings.BlockedUsers]: { screen: BlockedUsersScreen },
}
