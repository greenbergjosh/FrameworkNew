declare interface Window {
  GetGotInterface: {
    selectPhoto: () => {}
    submitForm: () => {}
    test: () => {}
  }
  loadedPhoto: (photoBase64: string) => void
}
