import { routes } from "constants"
import { EditProfileScreen } from "./EditProfileScreen"
import { PostDetailsScreen } from "./PostDetailsScreen"
import { ProfileScreen } from "./ProfileScreen"

export const profileRoutes = {
  [routes.Profile.Profile]: { screen: ProfileScreen },
  [routes.Profile.EditProfile]: { screen: EditProfileScreen },
  [routes.Profile.PostDetails]: { screen: PostDetailsScreen },
}
