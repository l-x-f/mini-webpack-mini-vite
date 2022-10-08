const fs = require('fs')
const path = require('path')
const Koa = require('koa')

// 解析.vue单文件组件  分离出 template  script  style
const compilerSfc = require('@vue/compiler-sfc')
// 解析dom  把template模板转换成render函数
const compileDom = require('@vue/compiler-dom')

// 解析路径
const pathResolve = (...dir) => path.resolve(__dirname, ...dir)

// 读取文件
const readFileSync = p => fs.readFileSync(pathResolve(p), 'utf-8')

const app = new Koa()

function rewriteImport(content) {
  return content.replace(/from ['"]([^'"]+)['"]/g, function (s0, s1) {
    // 改写node_module路径
    if (s1[0] !== '.' && s1[0] !== '/') {
      return `from '/@modules/${s1}'`
    }

    // 改写相对路径
    if (s1[0] == '.') {
      const rePath = '/src/' + s1.replace('./', '')
      return `from '${rePath}'`
    }

    return s0
  })
}

app.use(async ctx => {
  const {
    request: { url, query }
  } = ctx

  if (url == '/') {
    let content = readFileSync('./index.html')

    // 添加process 变量到全局  @vue/shared  里 用到 process
    content = content.replace(
      '<script',
      `
      <script>
        window.process = {env:{NODE_ENV:'DEV'}}
      </script>
      <script`
    )
    ctx.type = 'text/html'
    ctx.body = content
  } else if (url.endsWith('.js')) {
    const content = readFileSync(url.slice(1))
    ctx.type = 'application/javascript'

    // 改写node_module路径
    ctx.body = rewriteImport(content)
  } else if (url.startsWith('/@modules/')) {
    //   去node_module找对应的模快
    const prefix = pathResolve('node_modules', url.replace('/@modules/', ''))
    const module = require(prefix + '/package.json').module
    const modulePath = path.resolve(prefix, module)
    const content = readFileSync(modulePath)
    ctx.type = 'application/javascript'
    ctx.body = rewriteImport(content)
  } else if (url.indexOf('.vue') > -1) {
    const vueFilePath = pathResolve(url.split('?')[0].slice(1))
    const content = readFileSync(vueFilePath)
    // 解析单文件组件
    const { descriptor } = compilerSfc.parse(content)

    //  把 vue 文件一分为三  对应  template  script  style
    if (!query.type) {
      // 这是script
      ctx.type = 'application/javascript'
      ctx.body = `
        ${rewriteImport(descriptor.script?.content).replace(
          'export default',
          'const __script= '
        )}
        import "${url}?type=style"  
        import { render as __render } from "${url}?type=template"     
        __script.render = __render
        export default __script
      `
    } else if (query.type == 'template') {
      // template模板
      const template = descriptor.template
      const render = compileDom.compile(template.content, {
        mode: 'module'
      }).code
      console.log(render, 'render')

      ctx.type = 'application/javascript'
      ctx.body = rewriteImport(render)
    } else if (query.type == 'style') {
      // 这里只是解析了文件内的css 没有解析导入的css
      // style
      const style = descriptor.styles
      ctx.type = 'application/javascript'
      const content = `
      const css = '${style[0].content.replace(/\r\n/g, '')}'
      let link = document.createElement('style')
      link.setAttribute('type','text/css')
      document.head.appendChild(link)
      link.innerHTML = css
      export default css    `
      ctx.type = 'application/javascript'
      ctx.body = content
    }
  }
  //  else  if  可以继续添加对sass scss less等的支持
  else {
    ctx.body = 'body'
  }
})

app.listen(3000, () => {
  console.log('http://127.0.0.1:3000')
})
