import * as Store from "../store.types"
import { Option, none, some } from "fp-ts/lib/Option"
import { Either, left, right } from "fp-ts/lib/Either"

// declare module "./store.types" {
//   interface AppModels {
//     gapiAuth: {
//       state: State
//       reducers: Reducers
//       effects: Effects
//       selectors: Selectors
//     }
//   }
// }

// export interface State {
//   client: Option<gapi.auth2.GoogleAuth>
// }

// export interface Reducers {
//   update(updater: Partial<State>): void
// }

// export interface Effects {
//   handleAuthStateChange(isLoggedIn: boolean): void
//   initialize(): Promise<void>
//   listenForAuthChange(): Promise<void>
//   promptSignIn(): Promise<Either<Error, gapi.auth2.BasicProfile>>
//   signOut(): void
// }

// export interface Selectors {}

// const GOOGLE_AUTH_CONFIG = {
//   clientId: "427941496558-cinvoa6vcatjc6ckabmkjbip17ggp8rh.apps.googleusercontent.com",
//   scope: "profile email",
// }

// const extractUserFromProfile = (googleAuthUser: gapi.auth2.GoogleUser) => {
//   const profile = googleAuthUser.getBasicProfile()

//   return {
//     id: profile.getId(),
//     name: profile.getName(),
//     givenName: profile.getGivenName(),
//     familyName: profile.getFamilyName(),
//     imageUrl: profile.getImageUrl(),
//     email: profile.getEmail(),
//   }
// }

// export const gapiAuth: Store.AppModel<State, Reducers, Effects, Selectors> = {
//   state: {
//     client: none,
//   },

//   reducers: {
//     update: (state, updater) => ({ ...state, ...updater }),
//   },

//   effects: (dispatch) => ({
//     handleAuthStateChange(isSignedIn, { gapiAuth }) {
//       if (isSignedIn) {
//         gapiAuth.client
//           .map((client) => extractUserFromProfile(client.currentUser.get()))
//           .foldL(
//             function None() {
//               return dispatch.logger.logWarning(`Google auth client not available`)
//             },
//             function Some(user) {
//               dispatch.iam.update({ profile: some(user) })
//               dispatch.navigation.goToDashboard(none)
//             }
//           )
//       } else {
//         dispatch.iam.reset()
//         dispatch.navigation.goToLanding(none)
//       }
//     },

//     async initialize() {
//       // Load the Google API for auth
//       await new Promise((resolve) => window.gapi.load("client:auth2", resolve))
//       // When it's loaded, grab the GAuth client
//       // Initialize with our config
//       return (
//         window.gapi.client
//           .init(GOOGLE_AUTH_CONFIG)
//           // Once we're set up for Google Auth
//           .then(() => {
//             const authClient = window.gapi.auth2.getAuthInstance()
//             dispatch.gapiAuth.update({
//               client: some(authClient),
//             })
//             if (!authClient.isSignedIn.get()) {
//               dispatch.navigationV2.goToLanding(none)
//             }
//           })
//       )
//     },

//     async listenForAuthChange(_, { gapiAuth }) {
//       // Send the current state to rematch
//       // onAuthChange(gapiAuth.isSignedIn.get())
//       // Listen for any changes to the signed in status, refire to rematch
//       gapiAuth.client.foldL(
//         function None() {
//           return dispatch.logger.logWarning(`Google auth client not available`)
//         },
//         function Some(gapiAuth) {
//           gapiAuth.isSignedIn.listen((signedIn: boolean) => {
//             if (signedIn) {
//               const user = extractUserFromProfile(gapiAuth.currentUser.get())

//               dispatch.iam.update({ profile: some(user) })
//               dispatch.navigation.goToDashboard(none)
//             } else {
//               dispatch.iam.reset()
//               dispatch.navigation.goToLanding(none)
//             }
//           })
//         }
//       )
//     },

//     async promptSignIn(_, { gapiAuth }) {
//       return gapiAuth.client.foldL(
//         function None() {
//           return Promise.resolve(left(new Error(`Google auth client not available`)))
//         },
//         function Some(gapiAuth) {
//           return gapiAuth
//             .signIn()
//             .then((user) => right<Error, gapi.auth2.BasicProfile>(user.getBasicProfile()))
//             .catch((err) => left<Error, gapi.auth2.BasicProfile>(new Error(err)))
//         }
//       )
//     },

//     signOut(_, { gapiAuth }) {
//       return gapiAuth.client.foldL(
//         function None() {
//           dispatch.logger.logWarning(`Google auth client not available`)
//         },
//         function Some(gapiAuth) {
//           return gapiAuth.signOut()
//         }
//       )
//     },
//   }),

//   selectors: () => ({}),
// }
