import { gql } from 'apollo-server'

export const typeDefs_Post = gql`
  """
  貼文
  """
  type Post {
    "識別碼"
    id: ID!
    "作者"
    author: User
    "作者Id"
    authorId: String
    "標題"
    title: String
    "內容"
    body: String
    "按讚者"
    likeGivers: [User]
    "按讚者Id"
    likeGiverIds: [String]
    "建立時間 (ISO 格式)"
    createdAt: String
  }
`
