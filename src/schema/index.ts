import { typeDefs_User } from './User'
import { typeDefs_Post } from './Post'
import { typeDefs_Query } from './Query'
import { typeDefs_Mutation } from './Mutation'

const typeDefs = [
  typeDefs_Query,
  typeDefs_Mutation,
  typeDefs_User,
  typeDefs_Post
]

export default typeDefs
