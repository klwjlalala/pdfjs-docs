# DrawLayer

`DrawLayer` 是 PDF.js 中用于渲染和管理 PDF 绘图内容的显示层组件。它负责处理 PDF 页面中的矢量图形、路径、形状等绘图元素的渲染。

## 概述

PDF 文档包含各种绘图指令，如线条、曲线、填充区域、渐变等。`DrawLayer` 将这些矢量绘图内容转换为可在浏览器中显示的图形元素，通常使用 SVG 或 Canvas 技术。

## 主要方法

### render(parameters)

渲染绘图层到指定的容器中。

**参数**:
- `parameters` (Object): 渲染参数对象
  - `viewport` (PageViewport): 页面视口对象
  - `div` (HTMLElement): 绘图层容器元素
  - `page` (PDFPageProxy): PDF 页面代理对象
  - `intent` (string, 可选): 渲染意图，默认 'display'
  - `annotationStorage` (AnnotationStorage, 可选): 注释存储对象
  - `optionalContentConfigPromise` (Promise, 可选): 可选内容配置

**返回值**: `Promise<void>`

```javascript
import { DrawLayer } from 'pdfjs-dist/web/pdf_viewer'

// 获取页面
const page = await pdf.getPage(1)
const viewport = page.getViewport({ scale: 1.0 })

// 创建绘图层容器
const drawDiv = document.createElement('div')
drawDiv.className = 'drawLayer'
container.appendChild(drawDiv)

// 渲染绘图层
await DrawLayer.render({
  viewport,
  div: drawDiv,
  page,
  intent: 'display'
})
```

### update(parameters)

更新现有的绘图层。

**参数**:
- `parameters` (Object): 更新参数对象
  - `viewport` (PageViewport): 新的页面视口对象
  - `div` (HTMLElement): 绘图层容器元素
  - `page` (PDFPageProxy): PDF 页面代理对象

```javascript
// 更新绘图层（例如缩放变化时）
const newViewport = page.getViewport({ scale: 2.0 })

DrawLayer.update({
  viewport: newViewport,
  div: drawDiv,
  page
})
```

## 绘图内容类型

### 路径绘制

```javascript
// 路径绘制示例
const pathData = {
  type: 'path',
  commands: [
    { cmd: 'moveTo', args: [100, 100] },
    { cmd: 'lineTo', args: [200, 100] },
    { cmd: 'lineTo', args: [150, 200] },
    { cmd: 'closePath', args: [] }
  ],
  style: {
    strokeColor: '#000000',
    fillColor: '#ff0000',
    lineWidth: 2
  }
}
```

### 文本绘制

```javascript
// 文本绘制示例
const textData = {
  type: 'text',
  content: '示例文本',
  position: [100, 200],
  style: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#000000'
  }
}
```

### 图像绘制

```javascript
// 图像绘制示例
const imageData = {
  type: 'image',
  src: 'data:image/png;base64,...',
  position: [50, 50],
  size: [200, 150]
}
```

## 完整示例

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { DrawLayer } from 'pdfjs-dist/web/pdf_viewer'

/**
 * 渲染带绘图层的PDF页面
 */
async function renderPageWithDrawLayer(pdf, pageNumber, container) {
  try {
    // 获取页面
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.0 })
    
    // 创建主容器
    const pageContainer = document.createElement('div')
    pageContainer.style.position = 'relative'
    pageContainer.style.width = viewport.width + 'px'
    pageContainer.style.height = viewport.height + 'px'
    container.appendChild(pageContainer)
    
    // 渲染页面背景
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    pageContainer.appendChild(canvas)
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    await page.render(renderContext).promise
    
    // 创建绘图层
    const drawDiv = document.createElement('div')
    drawDiv.className = 'drawLayer'
    drawDiv.style.position = 'absolute'
    drawDiv.style.left = '0'
    drawDiv.style.top = '0'
    drawDiv.style.width = viewport.width + 'px'
    drawDiv.style.height = viewport.height + 'px'
    pageContainer.appendChild(drawDiv)
    
    // 渲染绘图层
    await DrawLayer.render({
      viewport,
      div: drawDiv,
      page,
      intent: 'display'
    })
    
    // 添加交互功能
    setupDrawLayerInteractions(drawDiv)
    
  } catch (error) {
    console.error('渲染绘图层失败:', error)
  }
}

/**
 * 设置绘图层交互功能
 */
function setupDrawLayerInteractions(drawContainer) {
  // 监听绘图元素点击
  drawContainer.addEventListener('click', (event) => {
    const drawElement = event.target.closest('.drawElement')
    if (drawElement) {
      console.log('点击绘图元素:', drawElement.dataset.type)
      highlightDrawElement(drawElement)
    }
  })
  
  // 监听鼠标悬停
  drawContainer.addEventListener('mouseover', (event) => {
    const drawElement = event.target.closest('.drawElement')
    if (drawElement) {
      showDrawElementTooltip(drawElement, event)
    }
  })
  
  drawContainer.addEventListener('mouseout', (event) => {
    hideDrawElementTooltip()
  })
}

/**
 * 高亮绘图元素
 */
function highlightDrawElement(element) {
  // 清除之前的高亮
  document.querySelectorAll('.drawElement.highlighted').forEach(el => {
    el.classList.remove('highlighted')
  })
  
  // 添加高亮效果
  element.classList.add('highlighted')
}

/**
 * 显示绘图元素提示信息
 */
function showDrawElementTooltip(element, event) {
  const tooltip = document.createElement('div')
  tooltip.className = 'drawTooltip'
  tooltip.textContent = `类型: ${element.dataset.type}`
  tooltip.style.position = 'absolute'
  tooltip.style.left = event.pageX + 10 + 'px'
  tooltip.style.top = event.pageY - 30 + 'px'
  tooltip.style.background = '#333'
  tooltip.style.color = '#fff'
  tooltip.style.padding = '4px 8px'
  tooltip.style.borderRadius = '4px'
  tooltip.style.fontSize = '12px'
  tooltip.style.zIndex = '1000'
  
  document.body.appendChild(tooltip)
}

/**
 * 隐藏绘图元素提示信息
 */
function hideDrawElementTooltip() {
  const tooltip = document.querySelector('.drawTooltip')
  if (tooltip) {
    tooltip.remove()
  }
}
```

## 自定义绘图功能

```javascript
/**
 * 在绘图层上添加自定义绘图
 */
function addCustomDrawing(drawContainer, drawingData) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.style.position = 'absolute'
  svg.style.left = '0'
  svg.style.top = '0'
  svg.style.width = '100%'
  svg.style.height = '100%'
  svg.style.pointerEvents = 'none'
  
  drawingData.forEach(item => {
    let element
    
    switch (item.type) {
      case 'line':
        element = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        element.setAttribute('x1', item.x1)
        element.setAttribute('y1', item.y1)
        element.setAttribute('x2', item.x2)
        element.setAttribute('y2', item.y2)
        element.setAttribute('stroke', item.color || '#000')
        element.setAttribute('stroke-width', item.width || 1)
        break
        
      case 'circle':
        element = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        element.setAttribute('cx', item.cx)
        element.setAttribute('cy', item.cy)
        element.setAttribute('r', item.r)
        element.setAttribute('fill', item.fill || 'none')
        element.setAttribute('stroke', item.stroke || '#000')
        break
        
      case 'rect':
        element = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        element.setAttribute('x', item.x)
        element.setAttribute('y', item.y)
        element.setAttribute('width', item.width)
        element.setAttribute('height', item.height)
        element.setAttribute('fill', item.fill || 'none')
        element.setAttribute('stroke', item.stroke || '#000')
        break
    }
    
    if (element) {
      element.classList.add('customDraw')
      svg.appendChild(element)
    }
  })
  
  drawContainer.appendChild(svg)
}

// 使用示例
const customDrawings = [
  {
    type: 'line',
    x1: 50, y1: 50,
    x2: 150, y2: 150,
    color: '#ff0000',
    width: 2
  },
  {
    type: 'circle',
    cx: 200, cy: 100,
    r: 30,
    fill: 'rgba(0, 255, 0, 0.3)',
    stroke: '#00ff00'
  }
]

addCustomDrawing(drawDiv, customDrawings)
```

## CSS 样式

绘图层需要适当的 CSS 样式：

```css
.drawLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.drawLayer .drawElement {
  pointer-events: auto;
  cursor: pointer;
}

.drawLayer .drawElement:hover {
  opacity: 0.8;
}

.drawLayer .drawElement.highlighted {
  filter: drop-shadow(0 0 5px #007acc);
}

.drawLayer svg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.drawLayer .customDraw {
  pointer-events: auto;
}

.drawLayer .customDraw:hover {
  opacity: 0.7;
}

/* 绘图工具栏样式 */
.drawToolbar {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  gap: 4px;
}

.drawToolbar button {
  padding: 4px 8px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 2px;
}

.drawToolbar button:hover {
  background: #f0f0f0;
}

.drawToolbar button.active {
  background: #007acc;
  color: white;
}
```

## 绘图工具集成

```javascript
/**
 * 创建绘图工具栏
 */
function createDrawToolbar(container, drawLayer) {
  const toolbar = document.createElement('div')
  toolbar.className = 'drawToolbar'
  
  const tools = [
    { name: 'select', label: '选择', icon: '🔍' },
    { name: 'pen', label: '画笔', icon: '✏️' },
    { name: 'line', label: '直线', icon: '📏' },
    { name: 'rect', label: '矩形', icon: '⬜' },
    { name: 'circle', label: '圆形', icon: '⭕' },
    { name: 'eraser', label: '橡皮', icon: '🧽' }
  ]
  
  tools.forEach(tool => {
    const button = document.createElement('button')
    button.textContent = tool.icon
    button.title = tool.label
    button.dataset.tool = tool.name
    
    button.addEventListener('click', () => {
      setActiveTool(toolbar, tool.name, drawLayer)
    })
    
    toolbar.appendChild(button)
  })
  
  container.appendChild(toolbar)
  
  // 默认选择工具
  setActiveTool(toolbar, 'select', drawLayer)
}

/**
 * 设置活动绘图工具
 */
function setActiveTool(toolbar, toolName, drawLayer) {
  // 更新工具栏状态
  toolbar.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === toolName)
  })
  
  // 设置绘图层模式
  drawLayer.dataset.tool = toolName
  
  // 更新鼠标样式
  switch (toolName) {
    case 'pen':
      drawLayer.style.cursor = 'crosshair'
      break
    case 'eraser':
      drawLayer.style.cursor = 'grab'
      break
    default:
      drawLayer.style.cursor = 'default'
  }
}
```

## 注意事项

1. **性能优化**: 复杂的绘图内容可能影响渲染性能，考虑使用虚拟化或分层渲染。

2. **坐标系统**: 确保绘图坐标与 PDF 坐标系统正确对应。

3. **缩放适配**: 绘图元素需要随页面缩放正确调整大小和位置。

4. **事件处理**: 合理设置 `pointer-events` 属性以控制交互行为。

5. **内存管理**: 及时清理不需要的绘图元素以避免内存泄漏。

## 相关链接

- [AnnotationLayer API](/api/annotation-layer)
- [TextLayer API](/api/text-layer)
- [PDFPageProxy API](/api/pdf-page-proxy)
- [高级功能示例](/examples/advanced-features)