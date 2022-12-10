import * as Type from '../generated/graphql'
import * as helper from '../helper'
import * as db from '../database'

const resolvers: Type.Resolvers = {
  Query: {
    hello: () => 'world',
    me: () => helper.findUserByUserId(db.meId),
    users: () => db.users,
    user: (root, { name }, context) => helper.findUserByName(name),
    posts: () => db.posts,
    post: (root, { id }, context) => helper.findPostByPostId(id)
  },
  User: {
    posts: (parent, args, context) => helper.filterPostsByUserId(parent.id),
    friends: (parent, args, context) => {
      // if (!parent.friendIds) return []
      return helper.filterUsersByUserIds(parent.friendIds || [])
    }
  },
  Post: {
    author: (parent, args, context) => {
      if (!parent.authorId) return null
      return helper.findUserByUserId(parent.authorId)
    },
    likeGivers: (parent, args, context) => {
      // if (!parent.likeGiverIds) return []
      return helper.filterUsersByUserIds(parent.likeGiverIds || [])
    }
  }
}

export default resolvers
