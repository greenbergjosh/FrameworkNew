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
import {
  PhotoSelectStatus,
  useActionSheetTakeSelectPhoto,
} from "../../../hooks/useActionSheetTakeSelectPhoto"

export interface InfluencerTokens {
  [key: string]: unknown
}

interface ActionMessage {
  action: string
  payload: any
}

interface PromotionsCampaignNavigationParams {
  draft: boolean
  template: CampaignTemplate

  influencerTokens: InfluencerTokens
  requiredTokens: string[]
  promotionId: GUID
}

interface PromotionsCampaignScreenProps
  extends NavigationTabScreenProps<PromotionsCampaignNavigationParams>,
    ActionSheetProps {}
export const PromotionsCampaignScreen = (props: PromotionsCampaignScreenProps) => {
  const getgotWebTemplate: React.RefObject<WebView> = React.useRef(null)
  const [showMessageModal, setShowMessageModal] = React.useState(false)
  const [promptKey, setPromptKey] = React.useState<string>(null)

  const { draft, template, influencerTokens = {} } = props.navigation.state.params
  const setInfluencerToken = React.useCallback(
    (value, tokenKey?: string) => {
      props.navigation.setParams({
        influencerTokens: {
          ...influencerTokens,
          [tokenKey || promptKey]: value,
        },
      })
    },
    [influencerTokens, promptKey, props.navigation]
  )

  const setRequiredTokens = React.useCallback(
    (requiredTokens: string[]) => {
      props.navigation.setParams({
        requiredTokens,
      })
    },
    [influencerTokens, promptKey, props.navigation]
  )

  const showPhotoPrompt = useActionSheetTakeSelectPhoto(
    (imageResult, promptKey: string = "photo") => {
      if (imageResult.status === PhotoSelectStatus.PERMISSION_NOT_GRANTED) {
        alert("Sorry, GetGot needs your permission to enable selecting this photo!")
        setPromptKey(null)
      } else if (imageResult.status === PhotoSelectStatus.SUCCESS) {
        const imageBase64 = imageResult.base64

        setShowMessageModal(false)
        setInfluencerToken(imageBase64, promptKey)
        setPromptKey(null)

        if (getgotWebTemplate.current) {
          getgotWebTemplate.current.injectJavaScript(
            `
          window.loadedPhoto(\`${imageBase64}\`${promptKey ? `, \`${promptKey}\`` : ""}); 
          true;
          `
          )
        }
      }
    }
  )

  const handlers = React.useMemo(
    () => ({
      selectPhoto: async ({ propertyName }) => {
        showPhotoPrompt(propertyName)
      },
      selectVideo: async ({ propertyName, url }) => {
        alert(`Selected video - ${propertyName}:${url}`)
        setInfluencerToken(url, propertyName)
      },
      editText: ({ propertyName }) => {
        setShowMessageModal(true)
        setPromptKey(propertyName)
      },
      setRequiredTokens: ({ requiredTokens }) => {
        setRequiredTokens(requiredTokens)
      },
      test: () => {
        alert("Test!")
      },
    }),
    [showPhotoPrompt]
  )

  const renderedWebView = React.useMemo(
    () => (
      <WebView
        ref={getgotWebTemplate}
        injectedJavaScript={`${initializeGetGotInterface.toString()}; initializeGetGotInterface(); 
  
  setTimeout(() => window.setTemplate(\`${template.template.html}\`), 10); `}
        source={{
          uri: `http://ec2-35-170-186-135.compute-1.amazonaws.com/?&templateId=${
            template.id
          }&randomSeed=${Math.round(Math.random() * 4000)}`,
        }}
        onMessage={(event) => {
          const message: ActionMessage = JSON.parse(event.nativeEvent.data)
          handlers[message.action](message.payload)
        }}
      />
    ),
    []
  )

  return (
    <>
      <TextAreaModal
        initialValue={influencerTokens[promptKey] as string}
        onCancel={() => setShowMessageModal(false)}
        onOK={(message) => {
          setShowMessageModal(false)
          setInfluencerToken(message)

          getgotWebTemplate.current.injectJavaScript(
            `
              window.editedText(\`${message}\`${promptKey ? ", `" + promptKey + "`" : ""}); 
              true;
              `
          )
          setPromptKey(null)
        }}
        title={promptKey}
        visible={showMessageModal}
      />
      {renderedWebView}
      {/* <WebView
        ref={getgotWebTemplate}
        injectedJavaScript={`${initializeGetGotInterface.toString()}; initializeGetGotInterface(); 
        
        setTimeout(() => window.setTemplate(\`${
          template.template.html
        }\`), 10); alert("Javascript Injected")`}
        source={{
          uri: `http://ec2-35-170-186-135.compute-1.amazonaws.com/?templateId=${
            template.id
          }&randomSeed=${Math.round(Math.random() * 4000)}`,
        }}
        onMessage={(event) => {
          const message: ActionMessage = JSON.parse(event.nativeEvent.data)
          handlers[message.action](message.payload)
        }}
      /> */}
    </>
  )
}

function initializeGetGotInterface() {
  // @ts-ignore
  window.GetGotInterface = {
    selectPhoto(propertyName: string) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ action: "selectPhoto", payload: { propertyName } })
      )
    },
    selectVideo(propertyName: string, url: string) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ action: "selectVideo", payload: { propertyName, url } })
      )
    },
    editText(propertyName: string | null) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ action: "editText", payload: { propertyName } })
      )
    },
    setRequiredTokens(requiredTokens: string[]) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ action: "setRequiredTokens", payload: { requiredTokens } })
      )
    },
    test() {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: "test" }))
    },
  }

  console.info("GetGotInterface has been initialized!")
}

PromotionsCampaignScreen.navigationOptions = ({ navigation }) => {
  console.log("PromotionsCampaignScreen#navigationOptions", navigation.state)
  const { draft, influencerTokens = {}, promotionId, requiredTokens = [], template } = navigation
    .state.params as PromotionsCampaignNavigationParams
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
        disabled={!requiredTokens.every((token) => token in influencerTokens)}
        onPress={() => {
          console.log("Parameters", navigation.params)
          navigation.navigate("PromotionsCampaignAdditionalImages", {
            draft,
            influencerTokens,
            promotionId,
            template,
          })
        }}
        style={{ backgroundColor: "#343997", borderWidth: 0 }}>
        <Text style={{ fontWeight: "bold", color: "#fff" }}>Next</Text>
      </Button>
    ),
  }
}
