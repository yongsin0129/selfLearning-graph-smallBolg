import express from 'express'
import * as db from '../database'
import * as Type from '../generated/graphql'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ForbiddenError } from 'apollo-server'
const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET

// helper functions
export const filterPostsByUserId = (userId: string) =>
  db.posts.filter(post => userId === post.authorId)

export const filterUsersByUserIds = (userIds: (string | null)[]) =>
  db.users.filter(user => userIds.includes(user.id))

export const findUserByUserId = (userId: string) => {
  return db.users.find(user => user.id === userId) || null
}

export const findUserByName = (name: string) =>
  db.users.find(user => user.name === name) || null

export const findPostByPostId = (postId: string) =>
  db.posts.find(post => post.id === postId) || null

export const updateUserInfo = (
  userId: string,
  data: Type.UpdateMyInfoInput
) => {
  return Object.assign(findUserByUserId(userId)!, data)
}

export const addPost = ({ authorId, title, body }: addPostInputType) => {
  return (db.posts[db.posts.length] = {
    id: (Number(db.posts[db.posts.length - 1].id) + 1).toString(),
    authorId,
    title,
    body: body || '',
    likeGiverIds: [],
    createdAt: new Date().toISOString()
  })
}

export const updatePost = (postId: string, data: Type.AddPostInput) =>
  Object.assign(findPostByPostId(postId)!, data)

export const hash = (text: string) => bcrypt.hash(text, SALT_ROUNDS)

export const addUser = async ({
  name,
  email,
  password,
  age
}: addUserInputType) => {
  const user = (db.users[db.users.length] = {
    id: (Number(db.users[db.users.length - 1].id) + 1).toString(),
    name,
    email,
    password: await hash(password),
    age,
    friendIds: []
  })
  return user
}

export const createToken = ({ id, email, name }: createTokenInputType) => {
  const jwtToken = jwt.sign({ id, email, name }, JWT_SECRET!, {
    expiresIn: '1 days'
  })
  return jwtToken
}

export const getMe = async (req: express.Request) => {
  // 1. 取出
  const token = req.headers['foo-token'] as string | undefined
  if (token) {
    try {
      // 2. 檢查 token + 取得解析出的資料
      const me = await jwt.verify(token, JWT_SECRET!)
      // 3. 放進 context
      return me
    } catch (e) {
      throw new Error('token verify error. Sign in again.')
    }
  }
  // 如果沒有 token 就回傳空的 context 出去
  return null
}

export const isAuthenticated =
  (resolverFunc: resolversFncType) =>
  (parent: any, args: any, context: any) => {
    if (!context.me) throw new ForbiddenError('Not logged in.')
    return resolverFunc.apply(null, [parent, args, context])
  }

export const deletePost = (postId: string) =>
  db.posts.splice(
    db.posts.findIndex(post => post.id === postId),
    1
  )[0]

export const isPostAuthor =
  (resolverFunc: resolversFncType) =>
  (parent: any, args: any, context: any) => {
    const { postId } = args
    const { me } = context
    const isAuthor = findPostByPostId(postId)?.authorId === me.id
    if (!isAuthor) throw new ForbiddenError('Only Author Can Delete this Post')
    return resolverFunc.apply(null, [parent, args, context])
  }

/********************************************************************************
*
          ts type guards
*
*********************************************************************************/
// 實作 typeof 的 user-defined type guard
export function isTypeof<T> (value: unknown, prim: T): value is T {
  if (prim === null) {
    return value === null
  }
  return value !== null && typeof prim === typeof value
}

// 實作 isDefined 的 user-defined type guard
// 如果 arg 沒加上 undefined，則 filtered 的型別會推導成 (string | undefined)[]
// 但若是使用 arg: T | undefined，則 undefined 會從該型別被抽出，因此最終會推導成 string[]
export function isDefined<T> (arg: T | undefined): arg is T {
  return typeof arg !== 'undefined'
}

// 實作 isPresent 的 user-defined type guard
// Array filter 後的元素不會是 undefined 或 null
export function isPresent<T> (arg: T | undefined | null): arg is T {
  return arg !== null && typeof arg !== 'undefined'
}

/********************************************************************************
*
          type helper
*
*********************************************************************************/
type addPostInputType = {
  authorId: string
  title: string
  body?: string | null
}

type addUserInputType = {
  name: string
  age: number
  email: string
  password: string
}

type createTokenInputType = {
  id: string
  email: string
  name: string
}

type resolversFncType = {
  (parent: any, args: any, context: any): any
}
