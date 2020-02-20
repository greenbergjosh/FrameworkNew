import { routes } from "routes"
import { HomeFeedScreen } from "./HomeFeedScreen"
import { MessagesScreen } from "../messages/MessagesScreen"
import { SettingsDrawer } from "../settings/SettingsDrawer"

export const homeRoutes = {
  [routes.Home.Feed]: { screen: HomeFeedScreen },
  [routes.Home.Messages]: { screen: MessagesScreen },
  [routes.Home.Settings]: { screen: SettingsDrawer },
}
