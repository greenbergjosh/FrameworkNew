import { routes } from "routes"
import { MessagesScreen } from "./MessagesScreen"
import { CreateChatScreen } from "./CreateChatScreen"
import { ChatScreen } from "./ChatScreen"

export const messagesRoutes = {
  [routes.Messages.Messages]: { screen: MessagesScreen },
  [routes.Messages.CreateChat]: { screen: CreateChatScreen },
  [routes.Messages.Chat]: { screen: ChatScreen },
}
