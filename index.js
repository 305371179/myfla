const {start,parseCss, parseHtml,parseShape,getChildByIndex, output, getLayers, getDOMLayers} = require('./lib/utils')

start('test.fla', (jsonPath) => {
  // console.log(jsonPath._data.DOMDocument.timelines.DOMTimeline.layers.DOMLayer.frames.DOMFrame.elements.DOMShape.edges,4444)
  // return
  const layers = getLayers(jsonPath)
  const DOMLayer = layers.DOMLayer
  // 只有一层
  let frames = getChildByIndex(DOMLayer,'frames')
  const elements = frames.DOMFrame.elements
  if(!elements)return
  const DOMShape = getChildByIndex(elements,'DOMShape')
  if(!DOMShape)return
  const Edge = getChildByIndex(DOMShape.edges,'Edge')
  const edges = getChildByIndex(Edge,'edges')
  // console.log(Edge,555,DOMShape.edges.Edge[0].edges)
  // return
  // console.log(edges,44444)
  // return
  parseShape(edges)
  parseHtml()
  parseCss()
  output()
})