import express from 'express'
import * as db from '../database'
import * as Type from '../generated/graphql'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AuthenticationError, ForbiddenError } from 'apollo-server'
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
    expiresIn: '30 days'
  })
  return jwtToken
}

export const getMe = async (req: express.Request) => {
  // 1. ??????
  const token = req.headers['foo-token'] as string | undefined
  if (token) {
    try {
      // 2. ?????? token + ????????????????????????
      const me = await jwt.verify(token, JWT_SECRET!)
      // 3. ?????? context
      return { success: true, data: me }
    } catch (e) {
      return {
        success: false,
        message: 'token verify failed. Sign in again.',
        error: e
      }
    }
  }
  // ???????????? token ??????????????? context ??????
  return { success: false, message: 'no token found' }
}

export const isAuthenticated =
  (resolverFunc: resolversFncType) =>
  (parent: any, args: any, context: any) => {
    if (!context.me)
      throw new AuthenticationError(context.message || 'please log in')
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
// ?????? typeof ??? user-defined type guard
export function isTypeof<T> (value: unknown, prim: T): value is T {
  if (prim === null) {
    return value === null
  }
  return value !== null && typeof prim === typeof value
}

// ?????? isDefined ??? user-defined type guard
// ?????? arg ????????? undefined?????? filtered ????????????????????? (string | undefined)[]
// ??????????????? arg: T | undefined?????? undefined ??????????????????????????????????????????????????? string[]
export function isDefined<T> (arg: T | undefined): arg is T {
  return typeof arg !== 'undefined'
}

// ?????? isPresent ??? user-defined type guard
// Array filter ????????????????????? undefined ??? null
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
