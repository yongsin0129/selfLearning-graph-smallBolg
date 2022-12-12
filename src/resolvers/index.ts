import * as Type from '../generated/graphql'
import * as helper from '../helper'
import * as db from '../database'
import bcrypt from 'bcrypt'

const resolvers: Type.Resolvers = {
  Query: {
    hello: () => 'world',
    me: (root, args, { me }) => {
      if (!me) throw new Error ('please LogIn First');
      return helper.findUserByUserId(me.id)
    },
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
    },
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
  }
}

export default resolvers
