import { gql } from 'apollo-server'

export const typeDefs_Query = gql`
  "註解需要加在 resolver new GraphQLScalarType 那邊"
  scalar custom_Date
  scalar import_Date

  type Query {
    "測試用 Hello World"
    hello: String
    "取得目前使用者"
    me: User
    "取得所有使用者"
    users: [User]
    "依照名字取得特定使用者"
    user(name: String!): User
    "取得所有貼文"
    posts: [Post]
    "依照 id 取得特定貼文"
    post(id: ID!): Post
    "獲取現在時間"
    now: custom_Date
    "詢問日期是否為週五... TGIF!!"
    isFriday(date: custom_Date!): Boolean
    "獲取現在時間 - 使用他人寫的 import_Date"
    import_now: import_Date
    "詢問日期是否為週五... 使用他人寫的 import_Date"
    import_isFriday(date: import_Date!): Boolean
  }
`
