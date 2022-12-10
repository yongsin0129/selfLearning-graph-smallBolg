import { gql } from 'apollo-server'

export const typeDefs_Mutation = gql`
  type Mutation {
    updateMyInfo(input: UpdateMyInfoInput!): User
    addFriend(userId: ID!): User
    addPost(input: AddPostInput!): Post
    likePost(postId: ID!): Post
  }

  input UpdateMyInfoInput {
    name: String
    age: Int
    friendIds:[String]
  }

  input AddPostInput {
    title: String!
    body: String
    likeGiverIds:[String]
  }
`
