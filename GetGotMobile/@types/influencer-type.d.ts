type InfluencerType = UserType & {
  id: GUID
  statusPhrase: {
    template: string
    data?: {}
  }
  bio?: string
  feed?: PostType[]
  lastActivity: ISO8601String
}