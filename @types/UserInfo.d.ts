type UserInfoType = {
  userId: GUID
  handle: string
  avatarUri: string
  name?: string
}

type UserInfoFullType = UserInfoType & {
  postsCount: number
  followersCount: number
  followingCount: number
  followerSample: string[]
  bio: string
  bioLink: URL
  contact?: {
    email?: string
    phone?: string
  }
  gender?: "M" | "F" | "U"
  dob?: ISO8601String
}
