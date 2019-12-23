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
}
