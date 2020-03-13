
const fs = require('fs')
const util = require('util')
const path = require('path')
const ejs = require('ejs')
const config = require('./config')
// 异步优化
const stat = util.promisify(fs.stat)
const readdir = util.promisify(fs.readdir)
// 引入模版
const tplPath = path.join(__dirname,'./src/template/index.ejs')
const sourse = fs.readFileSync(tplPath) // 读出来的是buffer
const mime=require('./mime') 

module.exports = async function (request, response, filePath) {
  try {
    const stats = await stat(filePath)
    if(stats.isFile()){
        const mimeType = mime(filePath)
        response.statusCode = 200
        response.setHeader('Content-Type', mimeType)
        fs.createReadStream(filePath).pipe(response)
    }
    else if (stats.isDirectory()) {
      const files = await readdir(filePath)
      response.statusCode = 200
      response.setHeader('content-type', 'text/html')
      // response.end(files.join(','))
 
      const dir = path.relative(config.root, filePath) // 相对于根目录
      const data = {
        files,
        dir: dir ? `${dir}` : '' // path.relative可能返回空字符串（）
      }
 
      const template = ejs.render(sourse.toString(),data)
      response.end(template)
    }
  } catch (err) {
    response.statusCode = 404
    response.setHeader('content-type','text/plain')
    response.end(`${filePath} is not a file`)
  }
}
