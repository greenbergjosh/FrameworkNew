import { message } from "antd"

export const GetGotService = {
  selectPhoto(propertyName: string | null) {
    invoke("selectPhoto", propertyName)
  },
  selectVideo(propertyName: string, url: string) {
    invoke("selectVideo", propertyName, url)
  },
  editText(propertyName: string | null) {
    invoke("editText", propertyName || message)
  },
  test() {
    invoke("test")
  },
}

function invoke(functionName: string, ...args: any[]) {
  console.debug("Invoke Function", { functionName, arg: args })
  try {
    if (window.GetGotInterface) {
      console.debug(
        "Android available methods",
        Object.keys(window.GetGotInterface).join(", "),
        window.GetGotInterface
      )
      window.GetGotInterface[functionName](...args)
    } else if (window.webkit && window.webkit.messageHandlers) {
      console.debug(
        "Webkit available methods",
        Object.keys(window.webkit.messageHandlers).join(", "),
        window.webkit
      )
      window.webkit.messageHandlers[functionName].postMessage(args)
    } else {
      message.error("Sorry! Only Android and iOS devices are supported currently!")
    }
  } catch (ex) {
    console.error(`Attempted invocation of ${functionName} failed`, args, ex)
  }
}
