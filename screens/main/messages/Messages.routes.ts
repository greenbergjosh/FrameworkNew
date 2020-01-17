import { routes } from "constants"
import { MessagesScreen } from "./MessagesScreen"
import { NewMessageScreen } from "./NewMessageScreen"
import { ViewThreadScreen } from "./ViewThreadScreen"

export const messagesRoutes = {
  [routes.Messages.Messages]: { screen: MessagesScreen },
  [routes.Messages.NewMessage]: { screen: NewMessageScreen },
  [routes.Messages.ViewThread]: { screen: ViewThreadScreen },
}
