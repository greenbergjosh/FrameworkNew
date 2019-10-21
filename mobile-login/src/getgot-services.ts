import json5 from "json5"

export interface ILoginResponse {
  r: 0 | 106
}

export interface LoginResponseSuccess extends ILoginResponse {
  r: 0
  email: string
  handle: string
  imageurl: string
  name: string | null
  t: string
}

export interface LoginResponseFailure extends ILoginResponse {
  r: 106
  err: string
}

export type LoginResponse = LoginResponseSuccess | LoginResponseFailure

export const getgotServices = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const rawResponse = await fetch("https://getgotapp.com/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p: { login: { u: username, p: password } } }),
    })
    const content = await rawResponse.json()

    if (content.login) {
      if (content.login.r === 0) {
        return content.login
      } else if (content.login.m) {
        if (content.login.m.includes("{")) {
          return json5.parse(content.login.m.substr(content.login.m.indexOf("{")))
        }
        return { r: content.login.r, err: content.login.m }
      }
    }
    return content
  },
  fetchProfile: async (token: string): Promise<LoginResponse> => {
    const rawResponse = await fetch("https://getgotapp.com/api", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ i: { t: token }, p: { profile: {} } }),
    })
    const content = await rawResponse.json()

    if (content.profile) {
      if (content.profile.r === 0) {
        return content.profile
      } else if (content.profile.m) {
        if (content.profile.m.includes("{")) {
          return json5.parse(content.profile.m.substr(content.profile.m.indexOf("{")))
        }
        return { r: content.profile.r, err: content.profile.m }
      }
    }
    return content
  },
  fetchAppInfo: async (appId: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(temporaryMockSiteInfo[appId]), 2000)
    }) as Promise<AppInfo>
  },
}

export interface AppInfo {
  id: string
  name: string
  domain: string
  image: string
}

const temporaryMockSiteInfo = {
  "ac92be97-05f3-4ae0-a4af-13bd9e2b4569": {
    id: "ac92be97-05f3-4ae0-a4af-13bd9e2b4569",
    name: "Nude Retailer Site",
    domain: "https://devapps2-wixsite-com.filesusr.com",
    image:
      "https://scontent.cdninstagram.com/vp/ee052374f476c570f73bb5c02b17dfdf/5DE69A68/t51.2885-15/sh0.08/e35/s640x640/21577283_367432677020361_8171281976217567232_n.jpg?_nc_ht=scontent.cdninstagram.com",
  },
} as { [key: string]: AppInfo }
