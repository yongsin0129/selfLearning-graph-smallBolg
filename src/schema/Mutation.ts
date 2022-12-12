import { gql } from 'apollo-server'

export const typeDefs_Mutation = gql`
  type Mutation {
    updateMyInfo(input: UpdateMyInfoInput!): User
    addFriend(userId: ID!): User
    addPost(input: AddPostInput!): Post
    likePost(postId: ID!): Post
    "註冊。 email 與 passwrod 必填"
    signUp(name: String!, age: Int!, email: String!, password: String!): User
    "登入"
    login(email: String!, password: String!): Token
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
