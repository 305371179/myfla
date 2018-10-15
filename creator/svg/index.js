// const fs = require('fs')
const path = require('path')
const Mustache = require('mustache')
const Handlebars = require('handlebars')
const fs = require('fs-extra')
const rm = require('rimraf')
const jsPretty = require('js-pretty')
const {log} = require('../libs/log')
const {info, error, warn, notice} = log
const readFile = (file) => fs.readFileSync(file, 'utf-8');
const writeFile = (content, dest,isJs = true) => fs.writeFileSync(dest, isJs?jsPretty(content):content, 'utf-8')
var flaJason = ''
// 管理名称，防止重复
var namesManager = {}
var template = path.resolve(__dirname, 'template')
var templateData = {
  html: path.resolve(template, 'index.html'),
  libs: path.resolve(template,'libs'),
  css: path.resolve(template, 'css/index.css'),
  main: path.resolve(template, 'src/index.hbs'),
  // main: path.resolve(template, 'src/index.mustache'),
  shape: path.resolve(template, 'models/shape.js'),
  helper: path.resolve(template, 'models/helper.js'),
}
var projectData = {
  baseDir: '',
  html: {path: 'index.html'},
  main: {path: 'src/index.js'},
  // libs目录不用做字符串替换
  libs: {path: 'libs'},
  css: {path: 'css/index.css'}
}
var isFirst = true
exports.create = jsonPath => {
  namesManager = {}
  flaJason = readFile(jsonPath)
  flaJason = JSON.parse(flaJason)
  if (isFirst) {
    isFirst = false
    initTemplate()
    projectData.baseDir = path.resolve(__dirname, 'project', flaJason.projectName)
  }
  rm.sync(projectData.baseDir)
  createHtml()
  createCss()
  createJs()
  output()
}
// const render = (template, data, partials) => {
//   return Mustache.render(template, data, partials,['{{', '}}']);
// }
Handlebars.registerHelper('instance', function(name,isSame) {
  // if(!name){
    return formatName('instance',isSame)
  // }
  // return name.toLowerCase();
});
Handlebars.registerHelper('lower', function(name) {
  // if(!name){
    return name.toLowerCase()
  // }
  // return name.toLowerCase();
});
Handlebars.registerHelper('group', function(index) {
  return 'group'+index;
});
Handlebars.registerHelper('path', function(edges,strokes,fills,strokeStyle, fillStyle1, fillStyle,options) {
  if(!edges)return {}
  let str = parseShape(edges)
  const data = {}

  fillStyle = fillStyle || fillStyle1
  if(!isNaN(fillStyle)){
    const fill = fills[fillStyle-1]
      data.fill = fill.color?fill.color:'#000'
      data.fillWidth = fill.fillWidth?fill.fillWidth:1
  }else{
    data.fill = 'none'
  }
  if(!isNaN(strokeStyle)){
      const stroke = strokes[strokeStyle-1]
      data.stroke = stroke.color?stroke.color: '#000'//(color?color:'#000')
      data.strokeWidth = stroke.strokeWidth?strokes.strokeWidth:1
  }
  // console.log(arguments)
  // if(strokes.length){
  //   const stroke = strokes[0]
  //   data.stroke = stroke.color?stroke.color: '#000'//(color?color:'#000')
  //   data.strokeWidth = stroke.strokeWidth?strokes.strokeWidth:1
  // }
  // if(fills.length){
  //   const fill = fills[0]
  //   data.fill = fill.color?fill.color:''
  //   data.fillWidth = fill.fillWidth?fill.fillWidth:1
  // }else {
  //   data.fill = 'none'
  // }
  this.data = {
    attr:new Handlebars.SafeString(JSON.stringify(data)),
    path: str
  }
  // console.log(this.data)
  return options.fn(this);
  // return str;
});

const str2Float = str => {
  if (isNaN(str)) {
    str = str.replace('#', '')
    if (str.indexOf('.') !== -1) {
      let int = str.split('.')[0]
      let xs = str.split('.')[1]
      str = parseInt(int,16) + '.' + parseInt(xs,16)
    }else{
      str = parseInt(str,16)
    }
  }
  return parseFloat(str) / 20
}
const strs2Point = strs => {
  return [str2Float(strs[0]),str2Float(strs[1])]
}
const parsePath = (str,char) => {
  const points = []
  const strs = str.split(char)
  console.log(strs,344445)
  points.push(strs2Point(strs[0].split(' ')))
  const strsLast = strs[1].split(' ')
  points.push(strs2Point([strsLast[0],strsLast[1]]))
  if(strsLast.length===4){
    points.push(strs2Point([strsLast[2],strsLast[3]]))
  }
  return points
}
const parseShape = (str) => {
  str = str.replace(/\s\s/g,' ').trim().replace('\n','')
  const strs = str.split('!')
  // error(strs)
  let lastPoint = ''
  let jsStr = ''
  strs.forEach(item => {
    if (!item) {
      return
    }
    let char = ''
    if (item.indexOf('[') !== -1) {
      char = '['
    }else if (item.indexOf('|') !== -1){
      char = '|'
    }
    const points = parsePath(item, char)
    if(!(lastPoint&&lastPoint[0] === points[0][0]&&lastPoint[1] === points[0][1]))
      jsStr+= `M${points[0][0]} ${points[0][1]}`
    if(char === '['){
      jsStr+= `Q${points[1][0]} ${points[1][1]} ${points[2][0]} ${points[2][1]}`
    }else if(char === '|') {
      jsStr+= `L${points[1][0]} ${points[1][1]}`
    }
    lastPoint = points[points.length-1]
  })
  return jsStr
}
Handlebars.registerHelper('attr', function(strokes,fills,color,options) {
  return
  const data = {}
  if(strokes.length){
    const stroke = strokes[0]
    data.stroke = stroke.color?stroke.color: '#000'//(color?color:'#000')
    data.strokeWidth = stroke.strokeWidth?strokes.strokeWidth:1
  }
  if(fills.length){
    const fill = fills[0]
    data.fill = fill.color?fill.color:''
    data.fillWidth = fill.fillWidth?fill.fillWidth:1
  }else {
    data.fill = 'none'
  }
  this.data = new Handlebars.SafeString(JSON.stringify(data))
  return options.fn(this);
});
Handlebars.registerHelper('isContain', function(url, options) {
  if (url.indexOf('.mp4')>=0 || url.indexOf('.ogg')>=0) {
    return options.fn(this);
  }
  return options.inverse(this);
});
Handlebars.registerHelper('typeOf', function(type,type1,options) {
  if (type === type1) {
    return options.fn(this);
  }
  return options.inverse(this);
});
const render = (template, data, partials) => {
  return Handlebars.compile(template)(data);
  // return Mustache.render(template, data, partials,['{{', '}}']);
}
const initTemplate = () => {
  for (let key in templateData) {
    let filePath = templateData[key]
    const dest = path.resolve(projectData.baseDir, filePath)
    if(!path.parse(dest).ext) continue
    templateData[`${key}Content`] = readFile(filePath)
  }
  readFile(templateData.shape)
  // console.log(templateData)
}
const createHtml = () => {
  projectData.html.content = render(templateData.htmlContent, {title: flaJason.projectName})
}
const createCss = () => {
  projectData.css.content = render(templateData.cssContent, {})
}
const createJs = () => {
  const document = flaJason.document
  const scene = document.scene
  projectData.main.content = createMainContent(scene)

}
const createMainContent = (scene) => {
  // const name = formatName(scene.name)
  const instance = scene.name.toLowerCase()
  scene.width = flaJason.setting.width
  scene.height = flaJason.setting.height
  // let data = {
  //   instance: function () {
  //     return formatName('instance')
  //   },
  //   group: function () {
  //       return "group" + this.index
  //   },
  //   width: flaJason.setting.width,
  //   height: flaJason.setting.height,
  //   scene,
  //
  // }
  // const partials = {instance1: "{{#instance}}999{{/instance}}"}
  // console.log(templateData.mainContent,data,render(templateData.mainContent,data))
  // console.log(render(templateData.htmlContent, {title: flaJason.projectName}))
  // console.log(render(templateData.mainContent,data,partials))
  const content = render(templateData.mainContent,scene)
  notice(content)
  return content
}
const createLayersContent = (layers) => {
  const data = []
  layers.forEach(layer => {
    const framesData = {
      name: layer.name,
      frames: createFramesContent(layer.frames)
    }
    data.push(framesData)
  })
  return data
}
const createFramesContent = (frames) => {
  const data = []
  frames.forEach(frame => {
    const elementsData = {
      index: frame.index,
      elements: createElementContent(frame.elements)
    }
    data.push(elementsData)
  })
  return data
}
const createElementContent = (frames) => {
  const data = []
  frames.forEach(frame => {
    const elementsData = {
      index: frame.index,
      // elements: createElementContent(frame.elements)
    }
    data.push(elementsData)
  })
  return data
}
const output = () => {
  for (let key in projectData) {
    if (typeof projectData[key] !== 'object') {
      continue
    }
    createFile(projectData,key)
  }
}
const createFile = (data,key) => {
  const obj = data[key]
  const dest = path.resolve(projectData.baseDir, obj.path)
  const pathParser = path.parse(dest)
  const dirs = pathParser.ext? pathParser.dir: dest
  fs.mkdirsSync(dirs)
  if(!pathParser.ext) {
    fs.copySync(templateData[key],dest)
    return
  }
  let isJs = pathParser.ext === '.js'
  writeFile(obj.content?obj.content:'', dest, isJs)
}
const formatName = (name,isSame) => {
  let format = name.replace(/\s/g,'_')
  if(isSame === true){
    return format+(namesManager[format]?namesManager[format]:'')
  }
  if(namesManager[format]!== undefined){
    namesManager[format]++
  }else{
    namesManager[format]=0
  }
  console.log(namesManager,77777)
  return format+(namesManager[format]?namesManager[format]:'')
};