const {create} = require('../svg')
const uppercamelcase = require('uppercamelcase');
var flaJson = {}
// 管理名称，防止重复
var namesManager = {}
exports.parseDocument = (utils) => {
  namesManager = {}
  const {exit, currentFlaConstant, path,outPut} = utils
  //获取配置信息
  parseSetting(currentFlaConstant)
  //获取document信息
  getDocument(currentFlaConstant)
  const jsonPath = path.resolve(currentFlaConstant.outPath,'info.json')
  outPut(flaJson,jsonPath)
  create(jsonPath)
}
// 获取PublishSettings.xml的舞台宽高
const parseSetting = (currentFlaConstant) => {
  const properties  = currentFlaConstant.settingXml.profiles.profile.PublishJpegProperties
  flaJson.projectName = currentFlaConstant.projectName
  flaJson.setting = {
    width: parseInt(properties.Width.text()),
    height: parseInt(properties.Height.text())
  }
}
const getDocument = (currentFlaConstant) => {
  const DOMDocument = currentFlaConstant.documentXml.DOMDocument
  const document = getKeyValue(DOMDocument, 'frameRate')
  flaJson.document = document
  getScene(DOMDocument,document)
}
// 获取frames
const getScene = (DOMDocument,document) => {
  const DOMTimeline = DOMDocument.timelines.DOMTimeline
  // 获取scene
  const scene = getKeyValue(DOMTimeline, 'name')
  document.scene = scene
  getLayers(DOMTimeline,scene)
}
// layers至少有一个DOMLayers元素
const getLayers = (DOMTDOMTimeline,scene) => {
  scene.layers = []
  const layers = DOMTDOMTimeline.layers.DOMLayer
  layers.each((index, DOMLayer) => {
    const layer = {
      ...getKeyValue(DOMLayer,['name', 'color']),
      frames:[]
    }
    scene.layers.push({layer})
    getFrames(DOMLayer.frames.DOMFrame,layer.frames)

  })
  return layers
}
const getFrames = (DOMFrame,frames) => {
  DOMFrame.each((index,Frame) => {
    const frame = {
        ...getKeyValue(Frame,['index']),
      elements: []
    }
    frames.push(frame)
    getElements(Frame.elements,frame.elements)
  })
}
const getElements = (Elements,elements) => {
  // const excludes = ['attributes','parent','count','at','each','text']
  for(var key in Elements){
  //   let isExclude = false
  //   for(let i = 0;i<excludes.length;i++){
  //     if(excludes[i] === key){
  //       isExclude = true
  //       break;
  //     }
  //   }
  //   if(isExclude)continue
    switch (key) {
      case 'attributes':
      case 'parent':
      case 'count':
      case 'at':
      case 'each':
      case 'text':
        break
      case 'DOMShape':
        getShape(Elements.DOMShape,elements)
        break
    }
  }
}
const getShape = (DOMShape,elements) => {
  const shape = {
    name: formatName('shape'),
    type: 'shape',
    matrix: '',
    fills:[],
    strokes:[],
    edges:[]
  }
  if(DOMShape.matrix){
    shape.matrix=DOMShape.matrix.Matrix.attributes()
  }
  elements.push(shape)
  // getMatrix(DOMShape.matrix.Matrix,shape.matrix)
  if(DOMShape.fills)
  getFills(DOMShape.fills.FillStyle,shape.fills)
  if(DOMShape.strokes)
  getStrokes(DOMShape.strokes.StrokeStyle,shape.strokes)
  if(DOMShape.edges)
  getEdges(DOMShape.edges.Edge,shape.edges)
}
const getMatrix = (Matrix,matrix) => {
  const attributes = Matrix.attributes()
  for(let key in attributes){
    matrix[key] = attributes[key]
  }
}
const getFills = (FillStyle,fills) => {
  FillStyle.each((index,Fill)=>{
    const fill = {
      ...getKeyValue(Fill,['index']),
      ...getKeyValue(Fill.SolidColor,['color'])
    }
    fills.push(fill)
  })

}
const getStrokes = (StrokeStyle,strokes) => {
  StrokeStyle.each((index,Stroke)=>{
    const stroke = {
      ...getKeyValue(Stroke,['index']),
      ...getKeyValue(Stroke.SolidStroke,['scaleMode']),
      // ...getKeyValue(Stroke.SolidStroke.fill.SolidColor,['scaleMode']),
    }
    strokes.push(stroke)
  })
}
const getEdges = (Edges,edges) => {
  Edges.each((index,Edge)=>{
    const edge = {
      ...getKeyValue(Edge,['fillStyle1','strokeStyle','edges']),
    }
    edges.push(edge)
  })
}
const getKeyValue = (obj, attrs) => {
  const list = {}
  const attributes = obj.attributes()
    for(let key in attributes){
      let value = attributes[key]
        if(key === 'name') {
          value = formatName(value)
        }
        if(!isNaN(value)) value = parseInt(value)
        list[key] = value
  }
  return list
  // let list = {}
  // if (typeof attrs === 'string') {
  //   attrs = [attrs]
  // }
  // const attributes = obj.attributes()
  // attrs.forEach(key => {
  //   let value = attributes[key]
  //   if(!isNaN(value)) value = parseInt(value)
  //   list[key] = value
  //   // if(a){
  //   //   console.log(attributes,attrs,list)
  //   // }
  // })
  // return list
}
const formatName = (name) => {
  let format = name.replace(/\s/g,'_')
  if(namesManager[format]!== undefined){
    namesManager[format]++
  }else{
    namesManager[format]=0
  }
  return uppercamelcase(format+(namesManager[format]?namesManager[format]:''))
};