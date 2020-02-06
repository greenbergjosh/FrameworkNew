type CommentType = {
  id: GUID
  user: UserType
  message: string
  liked?: boolean
  likes: LikesType
  comments: CommentType[]
}

type CommentsType = {
  lastActivity: ISO8601String
  likes: LikesType
  comments: CommentType[]
  enabled: boolean
}