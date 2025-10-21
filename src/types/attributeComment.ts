export type AttributeComment = {
  id: string
  author: {
    name: string
    isAnonymous: boolean
    avatarUri?: string
  }
  message: string
  timestamp: string
}

export type AttributeCommentsData = {
  comments: AttributeComment[]
}
