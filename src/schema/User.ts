import { gql } from 'apollo-server'

export const typeDefs_User = gql`
  """
  使用者
  """
  type User {
    "識別碼"
    id: ID!
    "帳號 email"
    email: String!
    "名字"
    name: String
    "年齡"
    age: Int
    "朋友"
    friends: [User]
    "朋友們的Id"
    friendIds: [String]
    "貼文"
    posts: [Post]
    "貼文的Id"
    postIds: [String]
  }
`
