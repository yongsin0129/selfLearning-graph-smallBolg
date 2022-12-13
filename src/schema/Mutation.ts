import { gql } from 'apollo-server'

export const typeDefs_Mutation = gql`
  type Mutation {
    "更新自己的資料"
    updateMyInfo(input: UpdateMyInfoInput!): User
    "新增好友"
    addFriend(userId: ID!): User
    "新增貼文"
    addPost(input: AddPostInput!): Post
    "按讚貼文"
    likePost(postId: ID!): Post
    "註冊。 email 與 passwrod 必填"
    signUp(name: String!, age: Int!, email: String!, password: String!): User
    "登入"
    login(email: String!, password: String!): Token
    "刪除貼文"
    deletePost(postId: ID!): Post
  }

  input UpdateMyInfoInput {
    name: String
    age: Int
    friendIds: [String]
  }

  input AddPostInput {
    title: String!
    body: String
    likeGiverIds: [String]
  }

  type Token {
    token: String!
  }
`
