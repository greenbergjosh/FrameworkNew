type ImageType = {
  id: GUID
  source: { uri: string }
  dimensions?: { width?: number; height?: number }
  user?: UserInfoType
}
