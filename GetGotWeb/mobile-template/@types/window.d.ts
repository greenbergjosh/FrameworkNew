declare interface Window {
  GetGotInterface: {
    selectPhoto: (jsonObject?: string) => {}
    selectVideo: (jsonObject?: string, url: string) => {}
    submitForm: (jsonObject?: string) => {}
    test: (jsonObject?: string) => {}
    [key: string]: (jsonObject?: string) => {}
  }
  webkit: {
    messageHandlers: {
      selectPhoto: WebkitCommnication
      submitForm: WebkitCommnication
      test: WebkitCommnication
      [key: string]: WebkitCommnication
    }
  }
  loadedPhoto: (photoBase64: string, key: string) => void
  editedText: (text: string, key: string) => void
  setTemplate: (template: string) => void
  setTokenValues: (tokenValues: { [key: string]: string }) => void
}

interface WebkitCommnication<T> {
  postMessage: (T?: any) => void
}
