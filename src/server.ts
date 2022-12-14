if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
import { ApolloServer, gql } from 'apollo-server'
// ApolloServer: 讓我們啟動 server 的 class ，不但實作許多 GraphQL 功能也提供 web application 的功能 (背後使用 express)
// gql: template literal tag, 讓你在 Javascript 中使用 GraphQL 語法
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'

import typeDefs from './schema'
// Resolvers 是一個會對照 Schema 中 field 的 function map ，讓你可以計算並回傳資料給 GraphQL Server
import resolvers from './resolvers'
import * as helper from './helper'

// 初始化 Web Server ，需傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({
  // Schema 部分
  typeDefs,
  // Resolver 部分
  resolvers,
  context: async ({ req }) => {
    const res = await helper.getMe(req)
    if (res.success === true) return { me: res.data }
    return {
      // secret: process.env.SECRET
      // PrismaModels,
      message: res.message
    }
  },
  persistedQueries: process.env.NODE_ENV === 'production' ? false : undefined,
  cache: process.env.NODE_ENV === 'production' ? 'bounded' : undefined,
  // plugins:[ApolloServerPluginLandingPageGraphQLPlayground()] // 另外一種新名字的 ide :  landing page
})

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`NODE_ENV : ${process.env.NODE_ENV}`)
  console.log(`Server ready at ${url}`)
})
