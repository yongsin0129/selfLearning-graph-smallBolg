import * as db from '../database'
import * as Type from '../generated/graphql'

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

export const updateUserInfo = (userId: string, data: Type.UpdateMyInfoInput) =>
  Object.assign(findUserByUserId(userId)!, data)

export const addPost = ({ authorId, title, body }: addPostInputType) => {
  return db.posts[db.posts.length] = {
    id: (Number(db.posts[db.posts.length - 1].id) + 1).toString(),
    authorId,
    title,
    body: body || '',
    likeGiverIds: [],
    createdAt: new Date().toISOString()
  }
}

export const updatePost = (postId: string, data: Type.AddPostInput) =>
  Object.assign(findPostByPostId(postId)!, data)

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
