const fs = require('fs')
const path = require('path')
const unzip = require('unzip')
const parser = require('xml2json');
const jpp = require('json-path-processor')
const rm = require('rimraf')
const chokidar = require('chokidar');
const DOMDocument = 'DOMDocument.xml'
const PublishSettings = 'PublishSettings.xml'
const dest = 'output'
const template = 'template'
const src = 'src'
var css = 'css/index.css'
var js = 'js/index.js'
var cssContent = fs.readFileSync(path.resolve(template, css), 'utf-8')
var jsContent = fs.readFileSync(path.resolve(template, js), 'utf-8')
var htmlContent = fs.readFileSync(path.resolve(template, 'index.html'), 'utf-8')
var projectName = ''
var jsStr = ''
exports.start = start = (fla, processor) => {
  watch(fla, processor)
  projectName = path.parse(fla).name
  rm.sync(dest)
  let extract = unzip.Extract({path: dest})
  fs.createReadStream(fla).pipe(extract)
  let end = () => {
    const jsonPath = parseXml(path.resolve(dest, DOMDocument))
    processor(jsonPath)
  }
  extract.on('close', end)

  // const jsonPath = parseXml(path.resolve(dest, DOMDocument))
  // processor(jsonPath)
}
exports.parseCss = () => {
  const jsonPath = parseXml(path.resolve(dest, PublishSettings))
  const PublishJpegProperties = jsonPath.value('profiles.profile.PublishJpegProperties')
  cssContent = cssContent.replace('${width}', PublishJpegProperties.Width)
    .replace('${height}', PublishJpegProperties.Height)
}
exports.parseHtml = () => {
  htmlContent = htmlContent.replace('${title}', projectName)
}
exports.output = () => {
  rm.sync(src)
  fs.mkdirSync(src)
  fs.mkdirSync(path.resolve(src, 'css'))
  fs.mkdirSync(path.resolve(src, 'js'))

  fs.writeFileSync(path.resolve(src, 'js/snap.svg.js'), fs.readFileSync(path.resolve(template, 'js/snap.svg.js'), 'utf-8'), 'utf-8')
  fs.writeFileSync(path.resolve(src, css), cssContent, 'utf-8')
  fs.writeFileSync(path.resolve(src, js), jsContent.replace('${content}',jsStr), 'utf-8')
  fs.writeFileSync(path.resolve(src, 'index.html'), htmlContent, 'utf-8')
}
exports.getLayers = data => {
  return data.value('DOMDocument.timelines.DOMTimeline.layers')
}
exports.getChildByIndex = (parent, attr, index = 0) => {
  let child = ''
  if (!parent.length) {
    child = parent[attr]
  } else {
    child = parent[index][attr]
  }
  return child
}
exports.parseShape = (str) => {
  console.log(str)
  // var a =11.4
  // console.log(a.toString(2))
  // console.log('1866  2804.5[#735.17 #C49.2D 1880 3498'.replace(/\s\s/g,' ').split(' '))
  // str = '!735 241[#2E0.8B #F6.E 731 254!731 254[711 278 440 421'
  // str = '!735 241[736.139 246.14 731 254!731 254[711 278 440 421'
  // str = '!-3000 0|3000 0'
  // str = '!2840 3021[3310 2671 3505 2296'
  // console.log(str)
  // str = '!400 400[600 228 683 44'
  str = str.replace(/\s\s/g,' ')
  let strs = str.split('!')
  // console.log(strs)
  let s = ''
  let result = ''
  // strs = str = str.replace(/\n/g,'')
  // let delX = 0
  // let delY = 0
  let lastPoint = ''
  strs.forEach(item => {
    if (!item) {
      return
    }
    if (item.indexOf('[') !== -1) {
      let points = parseBezier(item)

      // console.log(points,555555555,delX)
      // for(let i =0;i<points.length;i++){
      //   if(i==0){
      //     delX=0
      //     delY=0
      //   }
      //   points[i][0]-=delX
      //   points[i][1]-=delY
      //   delX = points[i][0]
      //   delY = points[i][1]
      // }
      // console.log(points,4444444)

      console.log(lastPoint,points[0],lastPoint&&lastPoint[0] === points[0][0]&&lastPoint[1] === points[0][1])
      // if(!s)

      s += `mt(${points[0][0]},${points[0][1]}).`
      s += `qt(${points[1][0]},${points[1][1]},${points[2][0]},${points[2][1]}).`
      if(!(lastPoint&&lastPoint[0] === points[0][0]&&lastPoint[1] === points[0][1]))
      jsStr+= `M${points[0][0]} ${points[0][1]}`
      jsStr+= `Q${points[1][0]} ${points[1][1]} ${points[2][0]} ${points[2][1]}`
      lastPoint = points[2]
      // result += parseBase64Str([points[0]],'mt')
      // result += parseBase64Str([points[1],points[2]],'qt')
      // result+=parseCharQt(points,'bt')
      // points.forEach((pt, index) => {
      //   if (index === 0) {
      //     // result += parseChar(pt[0],pt[1],'qt')
      //     s += `bt(${pt[0]},${pt[1]},`
      //   } else if (index === 1) {
      //
      //     s += `${pt[0]},${pt[1]},`
      //   } else {
      //     s += `${pt[0]},${pt[1]})`
      //   }
      // })
      // s += '.'
      // console.log(points)
    } else if (item.indexOf('|') !== -1) {
      let points = parseLine(item)
      console.log(lastPoint,points[0])

      s += `mt(${points[0][0]},${points[0][1]}).`
      s += `lt(${points[1][0]},${points[1][1]}).`
      if(!(lastPoint&&lastPoint[0] === points[0][0]&&lastPoint[1] === points[0][1]))
      jsStr+= `M${points[0][0]} ${points[0][1]}`
      jsStr+= `L${points[1][0]} ${points[1][1]}`
      lastPoint = points[1]
      points.forEach((pt, index) => {
        // if (index === 0) {
        //   result += parseChar(pt[0],pt[1],'mt')
        //   s += `mt(${pt[0]},${pt[1]}).`
        // } else if (index === 1) {
        //   // console.log(pt[0]-points[0][0],pt[1]-points[0][1],66666,result)
        //   result += parseChar(pt[0]-points[0][0],pt[1]-points[0][1],'lt')
        //   // console.log(result,666778788)
        //   s += `lt(${pt[0]},${pt[1]}).`
        // }
      })
      // s = s.substr(0, s.length - 1)
      console.log(points)
    }
  })
  s = s.substr(0,s.length-1)
  console.log(result)
  console.log(s)
}
const BASE_64 = {
  "A": 0,
  "B": 1,
  "C": 2,
  "D": 3,
  "E": 4,
  "F": 5,
  "G": 6,
  "H": 7,
  "I": 8,
  "J": 9,
  "K": 10,
  "L": 11,
  "M": 12,
  "N": 13,
  "O": 14,
  "P": 15,
  "Q": 16,
  "R": 17,
  "S": 18,
  "T": 19,
  "U": 20,
  "V": 21,
  "W": 22,
  "X": 23,
  "Y": 24,
  "Z": 25,
  "a": 26,
  "b": 27,
  "c": 28,
  "d": 29,
  "e": 30,
  "f": 31,
  "g": 32,
  "h": 33,
  "i": 34,
  "j": 35,
  "k": 36,
  "l": 37,
  "m": 38,
  "n": 39,
  "o": 40,
  "p": 41,
  "q": 42,
  "r": 43,
  "s": 44,
  "t": 45,
  "u": 46,
  "v": 47,
  "w": 48,
  "x": 49,
  "y": 50,
  "z": 51,
  "0": 52,
  "1": 53,
  "2": 54,
  "3": 55,
  "4": 56,
  "5": 57,
  "6": 58,
  "7": 59,
  "8": 60,
  "9": 61,
  "+": 62,
  "/": 63
};
const instructions = {
  '000000': 'A',//mt,2个 0
  '000100': 'E',//mt,3个 4

  '001000': 'I',//lt,2个 8
  '001100': 'M',//lt,3个 12

  '010000': 'Q',//qt,2个 16
  '010100': 'U',//qt,3个 20

  '011000': 'Y',//bt,2个 24
  '011100': 'c',//bt,3个 28

  '100000': 'g',//close 2个 32
  '100100': 'k',//close 3个 36
}
const operation = {
  'mt2': 'A',//mt,2个
  'mt3': 'E',//mt,3个
  'lt2': 'I',//lt,2个
  'lt3': 'M',//lt,3个
  'qt2': 'Q',//qt,2个
  'qt3': 'U',//qt,3个
  'bt2': 'Y',//bt,2个
  'bt3': 'c',//bt,3个
  'cp2': 'g',//bt,2个
  'cp3': 'k',//bt,3个
}
const getHeader = (type, length) => {
  return operation[type + length]
}
const parseChar = (x, y, type) => {
  let result = ''
  x = parse2(x)
  y = parse2(y)
  x = encode(x)
  y = encode(y)
  let max = Math.max(x.length, y.length)
  if (max > x.length) x = 'A' +x
  if (max > y.length) y = 'A' +y
  result += getHeader(type, max)
  result += x + y
  return result
}
//有6个变量
const parseBase64Str = (points, type) => {
  let result = ''
  let delX = 0
  let delY = 0
  let cs = []
  points.forEach(pt => {
    let x = pt[0] - delX
    delX = pt[0]
    let y = pt[1] - delY
    delY = pt[1]
    x = parse2(x)
    y = parse2(y)
    console.log(x,y)
    x = encode(x)
    y = encode(y)
    cs.push(x)
    cs.push(y)
  })
  console.log('cs的length',cs.length)
  let max = 0
  cs.forEach(item =>{
    if(max<item.length)max = item.length
  })
  let r = ''
  cs.forEach(item => {
    let length = max - item.length
    if(length<0)return
    let a = ''
    for(let i=0;i<length;i++){
      a+='A'
    }
    r = r+a+item
    // console.log((item+a).length,r,777777)
  })
  // console.log(r.length,1000000000)
  // console.log(type,max,555667777,r.length)
  r = getHeader(type, max) + r
  console.log(points,type,r,max)
  // result +=  r
  return r
}
const inertBefore = (v2, sign, length) => {
  let del = length - v2.length
  let c = ''
  for (let i = 0; i < del; i++) {
    if (i === 0) {
      if (sign === -1) {
        c += '1'
      } else {
        c += '0'
      }
      continue
    }
    c += '0'
  }
  return c + v2
}
const parse2 = (v) => {
  let sign = v < 0 ? -1 : 1
  let v2 = Math.abs(v).toString(2)
  if (v2.length < 12) {
    v2 = inertBefore(v2, sign, 12)
  } else if (v2.length < 18) {
    v2 = inertBefore(v2, sign, 18)
  }
  return v2
}
const encode = (v2) => {
  let length = v2.length / 6
  let str = ''
  for (let i = 0; i < length; i++) {
    // if(length===3){
    //   console.log(v2.substring(6,6),7777,v2.length,v2)
    //   console.log(parseInt(v2.substring(i*6,(i+1)*6),2),99999999,v2.substr(i*6,(i+1)*6),i*6,(i+1)*6,v2)
    // }
    // console.log(v2.substr(i * 6, 6))
    let c = getBase64Key(parseInt(v2.substr(i * 6, 6), 2))
    str += c
  }
  // console.log(str, 66666)
  return str
}
const getBase64Key = v => {
  for (let k in BASE_64) {
    if (BASE_64[k] === v) {
      // console.log(k)
      return k
    }
  }
}
const parseBezier = str => {
  let strs = str.split('[')
  let p00 = strs[0].split(' ')
  let p0 = [parseToFloat(p00[0]), parseToFloat(p00[1])]
  let p11 = strs[1].split(' ')
  let p1 = [parseToFloat(p11[0]), parseToFloat(p11[1])]
  let p2 = [parseToFloat(p11[2]), parseToFloat(p11[3])]
  return [p0, p1, p2]
}
const parseLine = str => {
  let strs = str.split('|')
  let p00 = strs[0].split(' ')
  let p0 = [parseToFloat(p00[0]), parseToFloat(p00[1])]
  let p11 = strs[1].split(' ')
  let p1 = [parseToFloat(p11[0]), parseToFloat(p11[1])]
  return [p0, p1]
}
const parseToFloat = str => {
  if (isNaN(str)) {
    // console.log(str)
    str = str.replace('#', '')
    if (str.indexOf('.') !== -1) {
      // console.log(55555)
      let int = str.split('.')[0]
      let xs = str.split('.')[1]
      // console.log(int, parseInt(int, 16))
      str = parseInt(int,16) + '.' + parseInt(xs,16)
    }else{
      str = parseInt(str,16)
      console.log(parseFloat(str) / 20,11111111111)
    }
    // console.log(str, 444)
  }
  // if(!str)console.log(33333333333333333333)
  // console.log(str)

  // console.log(str,6666666)
  // console.log(parseInt(parseFloat(str) / 20),66666666)
  // return parseInt(parseFloat(str) / 20*10)
  return parseFloat(str) / 20
}
const parseXml = xmlPath => {
  let xml = fs.readFileSync(path.resolve(dest, xmlPath), 'utf-8')
  // readXml(xml)
  let data = parser.toJson(xml)
  data = JSON.parse(data.toString())
  return jpp(data)
}
const watch = (fla, processor) => {
  let watcher = chokidar.watch([fla]);
  watcher.on('ready', function () {
    watcher.on('change', change)
  });
  const change = (path) => {
    start(fla, processor)
  }
}
// const readXml = (xml)=>{
//   const xmlreader = require('xmlreader')
//   xmlreader.read(xml,function (err,response) {
//     if(err){
//       return console.log(err)
//     }
//     console.log(response.DOMDocument.timelines.DOMTimeline.layers.DOMLayer.frames.DOMFrame.elements.DOMShape.edges)
//   })
// }
// const parseJs = (content) =>{
//   jsContent = jsContent.replace('${content}',content)
// }