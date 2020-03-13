import { CodeEntryScreen } from "./CodeEntryScreen"
import { ResendCodeScreen } from "./ResendCodeScreen"
import { SelectInterestsScreen } from "./SelectInterestsScreen"
import { SetPasswordScreen } from "./SetPasswordScreen"
import { CreateAccountScreen } from "./CreateAccountScreen"
import { SyncContactsScreen } from "./SyncContactsScreen"
import { TourScreen } from "./TourScreen"
import { routes } from "routes"

export const onboardingRoutes = {
  [routes.OnBoarding.CreateAccount]: { screen: CreateAccountScreen },
  [routes.OnBoarding.CodeEntry]: { screen: CodeEntryScreen },
  [routes.OnBoarding.ResendCode]: { screen: ResendCodeScreen },
  [routes.OnBoarding.SetPassword]: { screen: SetPasswordScreen },
  [routes.OnBoarding.SelectInterests]: { screen: SelectInterestsScreen },
  [routes.OnBoarding.SyncContacts]: { screen: SyncContactsScreen },
  [routes.OnBoarding.Tour]: { screen: TourScreen },
}
