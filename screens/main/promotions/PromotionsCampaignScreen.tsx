import { Button } from "@ant-design/react-native"
import { ActionSheetProps, connectActionSheet } from "@expo/react-native-action-sheet"
import Constants from "expo-constants"
import * as ImagePicker from "expo-image-picker"
import * as Permissions from "expo-permissions"
import React from "react"
import { Text } from "react-native"
import { WebView } from "react-native-webview"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { CampaignTemplate } from "../../../api/promotions-services"
import { HeaderTitle } from "../../../components/HeaderTitle"
import { TextAreaModal } from "../../../components/TextAreaModal"

export interface PromotionsCampaignScreenState {
  influencerTokens: { [key: string]: any }
  promptKey: string | null
  showMessageModal: boolean
}

interface ActionMessage {
  action: string
  payload: any
}

interface PromotionsCampaignNavigationParams {
  draft: boolean
  template: CampaignTemplate

  influencerTokens: PromotionsCampaignScreenState["influencerTokens"]
}

interface PromotionsCampaignScreenProps
  extends NavigationTabScreenProps<PromotionsCampaignNavigationParams>,
    ActionSheetProps {}
class _PromotionsCampaignScreen extends React.Component<
  PromotionsCampaignScreenProps,
  PromotionsCampaignScreenState
> {
  static navigationOptions = ({ navigation }) => {
    console.log("PromotionsCampaignScreen#navigationOptions", navigation.state)
    const { draft, influencerTokens = {} } = navigation.state
      .params as PromotionsCampaignNavigationParams
    return {
      headerLeft:
        draft &&
        (() => (
          <Button
            onPress={() => navigation.goBack("PromotionsCampaignList")}
            style={{ backgroundColor: "#343997", borderWidth: 0 }}>
            <Text style={{ color: "#fff" }}>Cancel</Text>
          </Button>
        )),
      headerTitle: () => <HeaderTitle title={draft ? "Create Campaign" : "Campaign"} />,
      headerRight: () => (
        <Button
          onPress={() => {
            console.log("Parameters", navigation.params)
            navigation.navigate("PromotionsCampaignAdditionalImages", { draft, influencerTokens })
          }}
          style={{ backgroundColor: "#343997", borderWidth: 0 }}>
          <Text style={{ fontWeight: "bold", color: "#fff" }}>Next</Text>
        </Button>
      ),
    }
  }

  getgotWebTemplate: WebView
  state = {
    showMessageModal: false,
    promptKey: null,
    influencerTokens: {},
  }

  promptSelectPhoto = async (promptKey) => {
    // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
    const options = ["Take Photo...", "Select from Library...", "Cancel"]
    const cancelButtonIndex = 2
    const neededPermissions = {
      0: [Permissions.CAMERA_ROLL, Permissions.CAMERA],
      1: [Permissions.CAMERA_ROLL],
    }

    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        // Do something here depending on the button index selected

        if (Constants.platform.ios) {
          const { status } = await Permissions.askAsync(...neededPermissions[buttonIndex])
          if (status !== "granted") {
            alert("Sorry, GetGot needs your permission to enable selecting this photo!")
            this.setState({
              promptKey: null,
            })

            return
          }
        }

        const action =
          buttonIndex === 0
            ? "launchCameraAsync"
            : buttonIndex === 1
            ? "launchImageLibraryAsync"
            : ""

        if (!action) {
          this.setState({
            promptKey: null,
          })
          return
        }

        const imageResult = await ImagePicker[action]({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          base64: true,
        })

        if (imageResult.cancelled === false) {
          const { influencerTokens } = this.state
          const imageBase64 = (imageResult as any).base64

          this.setState({
            showMessageModal: false,
            promptKey: null,
            influencerTokens: {
              ...influencerTokens,
              [promptKey]: imageBase64,
            },
          })
          this.props.navigation.setParams({
            influencerTokens: {
              ...influencerTokens,
              [promptKey]: imageBase64,
            },
          })

          this.getgotWebTemplate.injectJavaScript(
            `
              window.loadedPhoto(\`${imageBase64}\`${promptKey ? `, \`${promptKey}\`` : ""}); 
              true;
              `
          )
        }
      }
    )
  }

  handlers = {
    selectPhoto: async ({ propertyName }, showActionSheetWithOptions) => {
      this.promptSelectPhoto(propertyName)
    },
    editText: ({ propertyName }) => {
      this.setState({ showMessageModal: true, promptKey: propertyName })
    },
    test: () => {
      alert("Test!")
    },
  }

  render() {
    const { draft, template } = this.props.navigation.state.params
    const { influencerTokens, promptKey, showMessageModal } = this.state
    return (
      <>
        <TextAreaModal
          initialValue={influencerTokens[promptKey]}
          onCancel={() => this.setState({ showMessageModal: false })}
          onOK={(message) => {
            this.setState({
              showMessageModal: false,
              influencerTokens: { ...influencerTokens, [this.state.promptKey]: message },
            })
            this.props.navigation.setParams({
              influencerTokens: { ...influencerTokens, [this.state.promptKey]: message },
            })

            this.getgotWebTemplate.injectJavaScript(
              `
              window.editedText(\`${message}\`${promptKey ? ", `" + promptKey + "`" : ""}); 
              true;
              `
            )
          }}
          title={promptKey}
          visible={showMessageModal}
        />
        <WebView
          ref={(ref) => (this.getgotWebTemplate = ref)}
          nativeConfig={{ props: { webContentsDebuggingEnabled: true } }}
          injectedJavaScript={`${initializeGetGotInterface.toString()}; initializeGetGotInterface(); window.setTemplate(\`${
            template.template.html
          }\`);`}
          source={{
            uri: `http://ec2-35-170-186-135.compute-1.amazonaws.com/?templateId=${
              template.id
            }&randomSeed=${Math.round(Math.random() * 4000)}`,
          }}
          onMessage={(event) => {
            const message: ActionMessage = JSON.parse(event.nativeEvent.data)
            this.handlers[message.action](message.payload, this.props.showActionSheetWithOptions)
          }}
        />
      </>
    )
  }
}

function initializeGetGotInterface() {
  // @ts-ignore
  window.GetGotInterface = {
    selectPhoto(propertyName: string | null) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ action: "selectPhoto", payload: { propertyName } })
      )
    },
    editText(propertyName: string | null) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ action: "editText", payload: { propertyName } })
      )
    },
    test() {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: "test" }))
    },
  }

  console.info("GetGotInterface has been initialized!")
}

export const PromotionsCampaignScreen = connectActionSheet(_PromotionsCampaignScreen)
