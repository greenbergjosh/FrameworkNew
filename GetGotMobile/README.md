![GetGot](./assets/logo.png "image_tooltip")
# GetGot Mobile Dev Notes


## Supported Platforms



> *   iOS
> *   Android
> *   Web is not supported due to bugs in Ant Design Mobile dependency.


## Requirements



> *   [node and npm](https://nodejs.org/en/)
> *   [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
> *   iOS Emulator
>     *   [XCode](https://developer.apple.com/xcode/ ) installed on a Mac computer (not available on Windows)
> *   Android Emulator
>     *   [Install Android Studio](https://developer.android.com/studio)


## Install


```
yarn
```



## Run


```
yarn start // Only starts the Expo framework

-- OR --
yarn ios // Starts the Expo framework and the iOS Emulator

-- OR --
yarn android // Starts the Expo framework and the Android Emulator
```



## About the Codebase


#### Expo.io

This React Native app is created using Expo SDK 35. For more information, see [https://expo.io/](https://expo.io/). 

Provides:



*   CLI tool called “expo” that runs the dev server, launches emulators, and performs builds. But you will mostly want to use “yarn” to run the expo scripts defined in package.json.
*   Dev and build configurations (metro.config.js)
*   Ability to launch the app on device emulators. Supports hot reload during development.
*   An app that can be installed on your physical iOS or Android device that will connect to the dev server via your local network. Supports hot reloading during development.
*   Javascript access to device capabilities (camera, location, notifications, etc)
*   Core components


#### Ant Design Mobile UI Component Library

We use the UI components libraries from Expo, React Native, and Ant Design. No library was sufficient for the needs of this project alone. However, Ant Design drives much of the look and feel of the app. Whereas Expo and React Native components tend to be stylistically agnostic. For more information about Ant Design Mobile, see [https://mobile.ant.design/](https://mobile.ant.design/). 


#### Kmagiera and Software Mansions

We use multiple libraries provided by the Git user Kmagiera and his associated company Software Mansions. These libraries provide additional specific components and functionalities required by the application.



*   [https://github.com/software-mansion](https://github.com/software-mansion/)
*   [https://github.com/kmagiera](https://github.com/kmagiera?tab=repositories)


#### Firebase

The app also uses Firebase for notifications. The Expo project must be "ejected" to work with the Firebase API. 



*   Do not eject the branch using the npm script “eject”. Instead there is a development branch called "GetGotMobile_EJECTED" that contains the ejected version. 
*   Only make Firebase specific changes to this branch. 
*   Other development changes must be updated from "master" into this branch.


#### React Navigation

A router with transition animations the mimic iOS or Android look and feel. For more information, see [https://reactnavigation.org/](https://reactnavigation.org/). 


#### Data



*   As of October 2020, many of the API calls are mocked with example data stored in the project at **/data/api/*.mockData.ts. **
*   Mocked data is still passed through the data layer so all that needs to be done is to remove the Promise that returns mock data and uncomment the actual getgotRequest() call.


## About the Application Design

The application was designed in Adobe XD and stored in the cloud on [Robert Blaske](mailto:robertbl22@gmail.com)’s personal Adobe Create Cloud account. The mockup contains screens and navigation routes. Navigation transitions are specified (swipe up, cross-fade, slide left, etc).



*   [View published mockups for iOS here](https://assets.adobe.com/links?locale=en&filter=xdArtifacts&code=eyJ4NXUiOiJpbXNfbmExLWtleS0xLmNlciIsImFsZyI6IlJTMjU2In0.eyJpZCI6IjE2MDM4OTIwNDU0NzNfNjgwNjEzZDEtODU1NC00Nzc3LWI3MjYtNzY3MjZiMTMzMDA3X3VlMSIsImNsaWVudF9pZCI6ImFkb2JlZG90Y29tMiIsInVzZXJfaWQiOiI3QUNCMTQxRDQ0NkM4NUUxOTkyMDE2RTVAQWRvYmVJRCIsInR5cGUiOiJhdXRob3JpemF0aW9uX2NvZGUiLCJhcyI6Imltcy1uYTEiLCJmZyI6IlU0Uk9QWEVGWExHNTJQNkhDT1kzUU9RQUtZPT09PT09Iiwic2lkIjoiMTYwMzg5MjA0NTQ3N18xYzMxNmU2NS1mOTJjLTQ0MDEtODI4OC1mZWIyNDliZjdhMmRfdWUxIiwib3RvIjoidHJ1ZSIsImV4cGlyZXNfaW4iOiIxODAwMDAwIiwic2NvcGUiOiJjcmVhdGl2ZV9jbG91ZCxBZG9iZUlELG9wZW5pZCxnbmF2LHJlYWRfb3JnYW5pemF0aW9ucyxhZGRpdGlvbmFsX2luZm8ucHJvamVjdGVkUHJvZHVjdENvbnRleHQiLCJjcmVhdGVkX2F0IjoiMTYwMzg5MjA0NTQ3MyJ9.NpSHzzUUp6x_dHjHKKjxvikfGuAA3kzNASlrcIFpk_BCxDXlN9yJGnaXHeEpAFFiwRJMX9ZKjZBGRiFwuwl3iurNEtcLnv3HoziMlGBCo7Uov6eM_9JvNCmOzVwTDLUFhNTFrTS0yWpWD35lCz7eyKOCbUWnlmePoRB6rMrxPYLqswnRpW0-9MAYIeG8Vg7HCglJHYY85gdPrYevJ0YYKWvNxaL0vR8SYJqNAtZzhol-T4mKaizt-YIsmwooE_4y8SREkCTtxcw4bNmHP0lFeJO6KpbkKEavipyCjeodp7DUE_AI4ukIxpGNpuZF6Sp2xoLBe2TLUkP_2Sa2m_D5oA)
*   Published mockups allow for assets to be downloaded directly from the mockup.



## License

ISC © [OnPoint Global](https://onpointglobal.com/)
