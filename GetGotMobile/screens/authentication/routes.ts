import { BannedScreen } from "./BannedScreen"
import { LoginScreen } from "./LoginScreen"
import { ResetPasswordScreen } from "./ResetPasswordScreen"
import { NewPasswordScreen } from "./NewPasswordScreen"
import { ResendCodeScreen } from "./ResendCodeScreen"
import { routes } from "routes/index"

export const authenticationRoutes = {
  [routes.Authentication.Login]: { screen: LoginScreen },
  [routes.Authentication.Banned]: { screen: BannedScreen },
  [routes.Authentication.ResetPassword]: { screen: ResetPasswordScreen },
  [routes.Authentication.NewPassword]: { screen: NewPasswordScreen },
  [routes.Authentication.ResendCode]: { screen: ResendCodeScreen },
}
