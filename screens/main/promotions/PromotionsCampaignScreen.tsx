import { Button, Icon } from "@ant-design/react-native"
import { ActionSheetProps, connectActionSheet } from "@expo/react-native-action-sheet"
import Constants from "expo-constants"
import * as ImagePicker from "expo-image-picker"
import * as Permissions from "expo-permissions"
import { usePromotionsContext } from "providers/promotions-context-provider"
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

  campaignId?: GUID // If campaignId is provided, pull the template from there
  promotionId: GUID
}

interface PromotionsCampaignScreenProps
  extends NavigationTabScreenProps<PromotionsCampaignNavigationParams> {}
export const PromotionsCampaignScreen = (props: PromotionsCampaignScreenProps) => {
  const getgotWebView: React.RefObject<WebView> = React.useRef(null)
  const [showMessageModal, setShowMessageModal] = React.useState(false)
  const [promptKey, setPromptKey] = React.useState<string>(null)

  const promotionsContext = usePromotionsContext()

  const {
    campaignId,
    draft,
    influencerTokens = {},
    promotionId,
    template: paramsTemplate,
  } = props.navigation.state.params

  // Assume initially the template was selected in the previous screen or defaults to an empty object, for safety
  let template = paramsTemplate || ({} as Partial<CampaignTemplate>)

  let templateParts

  // If a campaign Id was provided, then this is an existing campaign with an already selected template
  if (campaignId) {
    // Look up that loaded campaign from the cache
    const loadedCampaign = promotionsContext.campaignsById[campaignId]
    // If the campaign is loaded
    if (loadedCampaign) {
      // Acquire the template ID from the campaign
      // TODO: This could also be a template URL from the messageBodyTemplateUrl property
      const templateId = promotionsContext.campaignsById[campaignId].messageBodyTemplateId
      // Look up the loaded template from the cache
      const loadedTemplate = promotionsContext.campaignTemplatesById[templateId]

      // Assign the template parts
      templateParts = loadedCampaign.templateParts

      // If we have the template already loaded in cache, use that one
      if (loadedTemplate) {
        template = loadedTemplate
      } else {
        // If we didn't already have that campaign loaded, then we need to load them
        // TODO: Might be nice to have a call to load a single campaign template
        // This is asynchronous, so we need to let the view finish loading after this
        promotionsContext.loadCampaignTemplates()
      }
    } else {
      // If the campaign wasn't loaded, we need to load the campaigns for this promotion
      // TODO: Might be nice to have a call to load a single campaign
      // This is asynchronous, so we need to let the view finish loading after this
      promotionsContext.loadPromotionCampaigns(promotionId)
    }
  }

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

        if (getgotWebView.current) {
          getgotWebView.current.injectJavaScript(
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
        ref={getgotWebView}
        injectedJavaScript={`${initializeGetGotInterface.toString()}; initializeGetGotInterface(); 
  
  setTimeout(() => {
    window.setTemplate(\`${template.template && template.template.html}\`)
    window.setTokenValues(${JSON.stringify(campaignId ? templateParts : influencerTokens)})
    alert(${JSON.stringify(campaignId ? templateParts : influencerTokens)})
  }, 10); `}
        source={{
          uri:
            template.id &&
            `http://ec2-35-170-186-135.compute-1.amazonaws.com/?&templateId=${
              template.id
            }&randomSeed=${Math.round(Math.random() * 4000)}`,
        }}
        onMessage={(event) => {
          const message: ActionMessage = JSON.parse(event.nativeEvent.data)
          handlers[message.action](message.payload)
        }}
      />
    ),
    [template]
  )

  return (
    <>
      <TextAreaModal
        initialValue={influencerTokens[promptKey] as string}
        onCancel={() => setShowMessageModal(false)}
        onOK={(message) => {
          setShowMessageModal(false)
          setInfluencerToken(message)

          getgotWebView.current.injectJavaScript(
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
  const { draft, influencerTokens = {}, promotionId, requiredTokens = [], template } = navigation
    .state.params as PromotionsCampaignNavigationParams
  return {
    headerLeft: draft
      ? undefined
      : () => (
          <Button
            onPress={() => navigation.navigate("Promotions")}
            style={{ backgroundColor: "#343997", borderWidth: 0 }}>
            <Icon name="arrow-left" />
          </Button>
        ),
    headerTitle: () => <HeaderTitle title={draft ? "Create Campaign" : "Campaign"} />,
    headerRight: () =>
      draft ? (
        <Button
          disabled={!requiredTokens.every((token) => token in influencerTokens)}
          onPress={() => {
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
      ) : null,
  }
}
