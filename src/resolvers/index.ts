import * as Type from '../generated/graphql'
import * as helper from '../helper'
import * as db from '../database'
import bcrypt from 'bcrypt'
import { custom_resolvers } from './custom'

const resolvers: Type.Resolvers = {
  Query: {
    hello: () => 'world',
    me: helper.isAuthenticated((parent, args, { me }) => {
      return helper.findUserByUserId(me.id)
    }),
    users: () => db.users,
    user: (root, { name }, context) => helper.findUserByName(name),
    posts: () => db.posts,
    post: (root, { id }, context) => helper.findPostByPostId(id),
    now: () => new Date(),
    isFriday: (root, { date }:Type.Scalars['custom_Date']) => date.getDay() === 5,
    import_now: () => new Date(),
    import_isFriday: (root, { date }:Type.Scalars['DateTime']) => date.getDay() === 5
  },
  Mutation: {
    updateMyInfo: helper.isAuthenticated((parent, { input }, { me }) => {
      // 過濾空值
      // const data = ['name', 'age'].reduce(
      //   (obj, key) => (input[key] ? { ...obj, [key]: input[key] } : obj),
      //   {}
      // )
      return helper.updateUserInfo(me.id, input)
    }),

    addFriend: helper.isAuthenticated((parent, { userId }, { me }) => {
      const _me = helper.findUserByUserId(me.id)
      if (_me?.friendIds.includes(userId))
        throw new Error(`User ${userId} Already Friend.`)
      const friend = helper.findUserByUserId(userId)
      // 更新自已的好友清單
      const newMe = helper.updateUserInfo(me.id, {
        friendIds: _me!.friendIds.concat(userId)
      })
      // 更新對方的好友清單
      helper.updateUserInfo(userId, {
        friendIds: friend!.friendIds.concat(me.id)
      })
      return newMe
    }),
    addPost: helper.isAuthenticated((parent, { input }, { me }) => {
      const { title, body } = input
      return helper.addPost({ authorId: me.id, title, body })
    }),
    deletePost: helper.isAuthenticated(
      helper.isPostAuthor((root, { postId }, { me }) =>
        helper.deletePost(postId)
      )
    ),
    likePost: helper.isAuthenticated((parent, { postId }, { me }) => {
      const post = helper.findPostByPostId(postId)
      if (!post) throw new Error(`Post ${postId} Not Exists`)
      if (!post.likeGiverIds.includes(me.id)) {
        return helper.updatePost(postId, {
          title: post.title,
          likeGiverIds: post.likeGiverIds.concat(me.id)
        })
      }
      return helper.updatePost(postId, {
        title: post.title,
        likeGiverIds: post.likeGiverIds.filter(id => id === me.id)
      })
    }),
    signUp: async (root, { name, age, email, password }, context) => {
      // 1. 檢查不能有重複註冊 email
      const isUserEmailDuplicate = db.users.some(user => user.email === email)
      if (isUserEmailDuplicate) throw new Error('User Email Duplicate')
      // 2. 建立新 user
      return helper.addUser({ name, age, email, password })
    },
    login: async (root, { email, password }, context) => {
      // 1. 透過 email 找到相對應的 user
      const user = db.users.find(user => user.email === email)
      if (!user) throw new Error('Email Account Not Exists')
      if (!user.password) throw new Error('user password Not Exists')
      // 2. 將傳進來的 password 與資料庫存的 user.password 做比對
      const passwordIsValid = await bcrypt.compare(password, user.password)
      if (!passwordIsValid) throw new Error('Wrong Password')

      // 3. 成功則回傳 token
      return { token: await helper.createToken(user) }
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
  },
  ...custom_resolvers
}

export default resolvers
