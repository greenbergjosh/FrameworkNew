import { message } from "antd"

export const GetGotService = {
  selectPhoto(propertyName: string | null) {
    invoke("selectPhoto", propertyName)
  },
  editText(propertyName: string | null) {
    invoke("editText", propertyName || message)
  },
  test() {
    invoke("test")
  },
}

function invoke(functionName: string, arg?: any) {
  console.debug("Invoke Function", { functionName, arg })
  try {
    if (window.GetGotInterface) {
      console.debug(
        "Android available methods",
        Object.keys(window.GetGotInterface).join(", "),
        window.GetGotInterface
      )
      // if (arg) {
      //   window.GetGotInterface[functionName](arg)
      // } else {
      window.GetGotInterface[functionName]()
      // }
    } else if (window.webkit && window.webkit.messageHandlers) {
      console.debug(
        "Webkit available methods",
        Object.keys(window.webkit.messageHandlers).join(", "),
        window.webkit
      )
      if (typeof arg !== "undefined") {
        window.webkit.messageHandlers[functionName].postMessage(arg)
      } else {
        window.webkit.messageHandlers[functionName].postMessage()
      }
    } else {
      message.error("Sorry! Only Android and iOS devices are supported currently!")
    }
  } catch (ex) {
    console.error(`Attempted invocation of ${functionName} failed`, arg, ex)
  }
}
