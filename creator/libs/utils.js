const fs = require('fs')
const path = require('path')
const unzip = require('unzip')
const rm = require('rimraf')
const chokidar = require('chokidar')
const jsonFormat = require('json-format');
const xmlreader = require('xmlreader')
const {log} = require('./log')
const {info, error, warn, notice} = log
const {constant} = require('./constant')
const {parseDocument} = require('./document')
const readFile = (xmlPath) => fs.readFileSync(xmlPath, 'utf-8')
const writeFile = (obj,dest) => fs.writeFileSync(dest,jsonFormat(obj), 'utf-8')
const currentFlaConstant = {}
const exit = (type, message) => {
  switch (type) {
    case 0:
      info(message)
      break
    case 1:
      error(message)
      break
    case 2:
      error(message)
      break
  }
  process.exit(type)
}
const parseXml = xmlPath => new Promise(resolve => {
  xmlreader.read(readFile(xmlPath), (error, xml) => {
    if (error) {
      return exit(1, error)
    }
    xml.getInt = attr => parseInt(this[attr])
    resolve(xml)
  })
})
const extractFla = (fla,outPath) => new Promise(resolve => {

  // return resolve()
  // 解压缩
  let extract = unzip.Extract({path: outPath})
  fs.createReadStream(fla).pipe(extract)
  extract.on('close', () => {
    resolve()
  })
})
const watch = (fla) => {
  // let watcher = chokidar.watch([fla]);
  // console.log(path.resolve(__dirname,'../svg/template/'),path.resolve(__dirname,'../svg/index.js'))
  let watcher = chokidar.watch([fla,path.resolve(__dirname,'../svg/template'),path.resolve(__dirname,'../svg/index.js')]);
  watcher.on('ready', function () {
    notice(`正则监听${fla}`)
    watcher.on('change', change)
  });
  const change = () => {
    utils.start(fla)
  }
}
const outPut = (json,dest)=>{
  writeFile(json,dest)
}
exports.utils = utils = {
  start: (fla,isWatch) => {
    currentFlaConstant.fla = {}
    currentFlaConstant.projectName = path.parse(fla).name
    currentFlaConstant.outPath = path.resolve(constant.XML_OUTPUT_PATH, currentFlaConstant.projectName);
    // 清空原来目录下的文件
    // rm.sync(currentFlaConstant.outPath)
    extractFla(fla,currentFlaConstant.outPath).then(() => {
      const document = parseXml(path.resolve(currentFlaConstant.outPath,constant.DOCUMENT))
      const setting = parseXml(path.resolve(currentFlaConstant.outPath,constant.SETTING))
      Promise.all([document, setting])
        .then(xmls => {
          currentFlaConstant.documentXml = xmls[0]
          currentFlaConstant.settingXml = xmls[1]
          // info(xmls)
          parseDocument({exit,currentFlaConstant,path,outPut})

        })
    })
    if(isWatch){
      watch(fla)
    }
  }
}
