// 使用他人已經寫的好的 scalars
import { DateTimeResolver } from 'graphql-scalars'

// GraphQLScalarType 是一個用來建造新的 Scalar Type 的 class
const { GraphQLScalarType } = require('graphql')
// 在建造新的 GraphQLScalarType 時，裡面的 parseLiteral function 會用 Kind 來檢查 Type 是否合乎需求
const { Kind } = require('graphql/language')

export const custom_resolvers = {
  // new GraphQLScalarType 有點像中間層
  // serialize : resolver return 的值原本會直接輸出，但現在會跑到這層的 value 再進入處理
  // parseValue : 原本會進到 resolver 層的 variables 會先進這層再到 resolver
  // parseValue : 原本會進到 resolver 層的 literal 會先用 ast 解析一次，再轉到 resolver
  custom_Date: new GraphQLScalarType({
    name: 'custom_Date',
    description:
      'Date custom scalar type : 日期格式。顯示時以 Unix Timestamp in Milliseconds 呈現。 例如 : 1540791381379',
    serialize (value: Date) {
      // 從 Resolver 傳到這邊進行處理，再輸出到前端
      return value.getTime() // 回傳 unix timestamp 值
    },
    parseValue (value: number) {
      // 從前端 variables 進來的 input
      return new Date(value) // 回傳 Date Object 到 Resolver
    },
    parseLiteral (ast: any) {
      // 從前端 query 字串進來的 input
      // 這邊僅接受輸入進來的是 Int 值
      if (ast.kind === Kind.INT) {
        // 回傳 Date Object 到 Resolver (記得要先 parseInt)
        return new Date(parseInt(ast.value, 10)) // ast value is always in string format
      }
      return null
    }
  }),
  // import_Date 自定義的名字
  import_Date: DateTimeResolver
  // 裡面的 nmae : DateTime!
  // 裡面的 description : A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the date-time format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
}

/********************************************************************************
*
          AST 格式

{
  kind:"IntValue" // 輸入參數的型別
  loc: {start: 84, end: 97, startToken: Tok, …} // 在 query 中的位址
  value:"1540791381379" // 輸入參數的值 (皆為 string 格式)
}

*
*********************************************************************************/
