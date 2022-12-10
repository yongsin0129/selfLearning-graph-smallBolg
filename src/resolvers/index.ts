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
  Mutation: {
    updateMyInfo: (parent, { input }, context) => {
      // 過濾空值
      // const data = ['name', 'age'].reduce(
      //   (obj, key) => (input[key] ? { ...obj, [key]: input[key] } : obj),
      //   {}
      // )
      return helper.updateUserInfo(db.meId, input)
    },
    addFriend: (parent, { userId }, context) => {
      const me = helper.findUserByUserId(db.meId)
      if (me?.friendIds.includes(userId))
        throw new Error(`User ${userId} Already Friend.`)

      const friend = helper.findUserByUserId(userId)
      const newMe = helper.updateUserInfo(db.meId, {
        friendIds: me!.friendIds.concat(userId)
      })
      helper.updateUserInfo(userId, {
        friendIds: friend!.friendIds.concat(db.meId)
      })

      return newMe
    },
    addPost: (parent, { input }, context) => {
      const { title, body } = input
      return helper.addPost({ authorId: db.meId, title, body })
    },
    likePost: (parent, { postId }, context) => {
      const post = helper.findPostByPostId(postId)

      if (!post) throw new Error(`Post ${postId} Not Exists`)

      if (!post.likeGiverIds.includes(db.meId)) {
        return helper.updatePost(postId, {
          title: post.title,
          likeGiverIds: post.likeGiverIds.concat(db.meId)
        })
      }

      return helper.updatePost(postId, {
        title: post.title,
        likeGiverIds: post.likeGiverIds.filter(id => id === db.meId)
      })
    }
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
