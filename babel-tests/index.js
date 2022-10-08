import {
  readFileSync as _readFileSync,
  writeFileSync as _writeFileSync,
  existsSync,
  mkdirSync
} from 'fs'
import { fileURLToPath, URL } from 'url'
// Babel解析器（以前叫babel-babylon）是Babel中使用的JavaScript解析器。
import babylon from '@babel/parser'
// 这个库主要是遍历AST，操作Node上的节点。
import traverse from '@babel/traverse'
import { transform, transformFileSync } from '@babel/core'

const pathResolve = dir => fileURLToPath(new URL(dir, import.meta.url))

// 读取文件
const readFileSync = p => _readFileSync(pathResolve(p), 'utf-8')
const writeFileSync = (p, data) => _writeFileSync(pathResolve(p), data)

const main = () => {
  const code = readFileSync('./tests/index.js')

  // 把文件解析成ast
  const ast = babylon.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  })
  writeFileSync('./dist/ast.json', JSON.stringify(ast, null, 2))

  // 新建文件
  if (!existsSync(pathResolve('./dist'))) {
    mkdirSync(pathResolve('./dist'), { recursive: true })
  }

  // 转换文件代码
  const transformFileResult = transformFileSync(
    pathResolve('./tests/tsx.tsx'),
    {
      parserOpts: {
        plugins: ['jsx', 'flow']
      },
      presets: ['@babel/preset-typescript']
    }
  )
  writeFileSync(
    './dist/transformFileSync.json',
    JSON.stringify(transformFileResult, null, 2)
  )

  // 转换代码
  const result = transform(code, {
    comments: false
  })
  writeFileSync('./dist/transformFromAst.json', JSON.stringify(result, null, 2))
  writeFileSync('./dist/transformFromAst.js', result.code)

  traverse.default(ast, {
    ImportDeclaration: ({ node }) => {
      console.log(node)
    }
  })
}

main()
