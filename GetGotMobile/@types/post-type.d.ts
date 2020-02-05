type PostType = {
  id: GUID
  image: ImageType
  user?: UserType
  promotionId: GUID
  campaignId: GUID
  liked?: boolean
  comments: CommentsType
}