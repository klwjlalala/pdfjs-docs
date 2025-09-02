# AnnotationLayer

`AnnotationLayer` 是 PDF.js 中用于渲染和管理 PDF 注释的显示层组件。它负责在 PDF 页面上显示各种类型的注释，如链接、文本注释、表单字段等。

## 概述

PDF 文档中的注释（Annotations）包括超链接、文本注释、表单字段、高亮等交互元素。`AnnotationLayer` 将这些注释渲染为 HTML 元素，使用户可以与之交互。

## 主要方法

### render(parameters)

渲染注释层到指定的容器中。

**参数**:
- `parameters` (Object): 渲染参数对象
  - `viewport` (PageViewport): 页面视口对象
  - `div` (HTMLElement): 注释层容器元素
  - `annotations` (Array): 注释数据数组
  - `page` (PDFPageProxy): PDF 页面代理对象
  - `imageResourcesPath` (string, 可选): 图像资源路径
  - `renderForms` (boolean, 可选): 是否渲染表单字段，默认 `false`
  - `linkService` (IPDFLinkService, 可选): 链接服务对象
  - `downloadManager` (IDownloadManager, 可选): 下载管理器
  - `annotationStorage` (AnnotationStorage, 可选): 注释存储对象

**返回值**: `Promise<void>`

```javascript
import { AnnotationLayer } from 'pdfjs-dist/web/pdf_viewer'

// 获取页面和注释数据
const page = await pdf.getPage(1)
const annotations = await page.getAnnotations()
const viewport = page.getViewport({ scale: 1.0 })

// 创建注释层容器
const annotationDiv = document.createElement('div')
annotationDiv.className = 'annotationLayer'
container.appendChild(annotationDiv)

// 渲染注释层
await AnnotationLayer.render({
  viewport,
  div: annotationDiv,
  annotations,
  page,
  renderForms: true
})
```

### update(parameters)

更新现有的注释层。

**参数**:
- `parameters` (Object): 更新参数对象
  - `viewport` (PageViewport): 新的页面视口对象
  - `div` (HTMLElement): 注释层容器元素
  - `annotations` (Array): 注释数据数组

```javascript
// 更新注释层（例如缩放变化时）
const newViewport = page.getViewport({ scale: 2.0 })

AnnotationLayer.update({
  viewport: newViewport,
  div: annotationDiv,
  annotations
})
```

## 注释类型

### 链接注释 (Link)

```javascript
// 链接注释示例
const linkAnnotation = {
  annotationType: 1, // LINK
  url: 'https://example.com',
  rect: [100, 100, 200, 120],
  // 其他属性...
}
```

### 文本注释 (Text)

```javascript
// 文本注释示例
const textAnnotation = {
  annotationType: 2, // TEXT
  contents: '这是一个文本注释',
  rect: [150, 200, 170, 220],
  // 其他属性...
}
```

### 表单字段 (Widget)

```javascript
// 表单字段注释示例
const widgetAnnotation = {
  annotationType: 8, // WIDGET
  fieldType: 'Tx', // 文本字段
  fieldName: 'username',
  rect: [100, 300, 300, 320],
  // 其他属性...
}
```

## 完整示例

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { AnnotationLayer } from 'pdfjs-dist/web/pdf_viewer'

/**
 * 渲染带注释的PDF页面
 */
async function renderPageWithAnnotations(pdf, pageNumber, container) {
  try {
    // 获取页面
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.0 })
    
    // 创建画布用于渲染页面内容
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    container.appendChild(canvas)
    
    // 渲染页面内容
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    await page.render(renderContext).promise
    
    // 获取注释数据
    const annotations = await page.getAnnotations()
    
    if (annotations.length > 0) {
      // 创建注释层容器
      const annotationDiv = document.createElement('div')
      annotationDiv.className = 'annotationLayer'
      annotationDiv.style.position = 'absolute'
      annotationDiv.style.left = '0'
      annotationDiv.style.top = '0'
      annotationDiv.style.width = viewport.width + 'px'
      annotationDiv.style.height = viewport.height + 'px'
      container.appendChild(annotationDiv)
      
      // 渲染注释层
      await AnnotationLayer.render({
        viewport,
        div: annotationDiv,
        annotations,
        page,
        renderForms: true
      })
    }
    
  } catch (error) {
    console.error('渲染注释层失败:', error)
  }
}
```

## CSS 样式

注释层需要适当的 CSS 样式来正确显示：

```css
.annotationLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.2;
  line-height: 1.0;
}

.annotationLayer section {
  position: absolute;
  text-align: initial;
}

.annotationLayer .linkAnnotation > a {
  position: absolute;
  font-size: 1em;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.annotationLayer .textAnnotation img {
  position: absolute;
  cursor: pointer;
}

.annotationLayer .popupWrapper {
  position: absolute;
  width: 20em;
}

.annotationLayer .popup {
  position: absolute;
  z-index: 200;
  max-width: 20em;
  background-color: #FFFF99;
  box-shadow: 0px 2px 5px #888;
  border-radius: 2px;
  padding: 0.6em;
  margin-left: 5px;
  cursor: pointer;
  font: message-box;
  word-wrap: break-word;
}
```

## 注意事项

1. **容器定位**: 注释层容器必须使用绝对定位，并与页面内容对齐。

2. **视口同步**: 注释层的视口必须与页面渲染的视口保持一致。

3. **表单渲染**: 如需支持表单交互，需要设置 `renderForms: true`。

4. **事件处理**: 注释层会自动处理点击、悬停等事件。

5. **性能考虑**: 大量注释可能影响性能，考虑按需渲染。

## 相关链接

- [TextLayer API](/api/text-layer)
- [PDFPageProxy API](/api/pdf-page-proxy)
- [注释处理示例](/examples/annotations)
- [表单填写示例](/examples/forms)