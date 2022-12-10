import * as db from '../database'

// helper functions
export const filterPostsByUserId = (userId: string) =>
  db.posts.filter(post => userId === post.authorId)

export const filterUsersByUserIds = (userIds: string[]) =>
  db.users.filter(user => userIds.includes(user.id))

export const findUserByUserId = (userId: string) =>
  db.users.find(user => user.id === userId)
