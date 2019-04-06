declare interface Window {
  gapi: {
    auth2: {
      getAuthInstance: () => gapi.auth2.GoogleAuth
    }
    client: {
      init: (c: {
        apiKey?: string
        discoveryDocs?: string[]
        clientId?: string
        scope?: string

        hosted_domain?: string
      }) => Promise<void>
    }
    load: (service: string, cb: () => void) => void
  }
}
