# TextLayer

`TextLayer` 是 PDF.js 中用于渲染和管理 PDF 文本内容的显示层组件。它将 PDF 页面中的文本内容转换为可选择、可搜索的 HTML 元素。

## 概述

PDF 文档中的文本通常以向量形式存储，`TextLayer` 将这些文本内容提取出来并渲染为 HTML 文本元素，使用户可以选择、复制文本，并支持浏览器的查找功能。

## 主要方法

### render(parameters)

渲染文本层到指定的容器中。

**参数**:
- `parameters` (Object): 渲染参数对象
  - `textContent` (TextContent): 文本内容对象
  - `container` (HTMLElement): 文本层容器元素
  - `viewport` (PageViewport): 页面视口对象
  - `textDivs` (Array, 可选): 文本元素数组
  - `textContentItemsStr` (Array, 可选): 文本内容字符串数组
  - `enhanceTextSelection` (boolean, 可选): 是否增强文本选择，默认 `false`

**返回值**: `Promise<void>`

```javascript
import { TextLayer } from 'pdfjs-dist/web/pdf_viewer'

// 获取页面和文本内容
const page = await pdf.getPage(1)
const textContent = await page.getTextContent()
const viewport = page.getViewport({ scale: 1.0 })

// 创建文本层容器
const textDiv = document.createElement('div')
textDiv.className = 'textLayer'
container.appendChild(textDiv)

// 渲染文本层
await TextLayer.render({
  textContent,
  container: textDiv,
  viewport,
  enhanceTextSelection: true
})
```

### update(parameters)

更新现有的文本层。

**参数**:
- `parameters` (Object): 更新参数对象
  - `container` (HTMLElement): 文本层容器元素
  - `viewport` (PageViewport): 新的页面视口对象
  - `textDivs` (Array): 文本元素数组
  - `rotation` (number, 可选): 旋转角度

```javascript
// 更新文本层（例如缩放变化时）
const newViewport = page.getViewport({ scale: 2.0 })

TextLayer.update({
  container: textDiv,
  viewport: newViewport,
  textDivs: textDivs
})
```

## TextContent 对象

`TextContent` 对象包含页面的文本信息：

```javascript
// TextContent 对象结构
const textContent = {
  items: [
    {
      str: '文本内容',        // 文本字符串
      dir: 'ltr',           // 文本方向 (ltr/rtl)
      width: 100,           // 文本宽度
      height: 12,           // 文本高度
      transform: [12, 0, 0, 12, 100, 200], // 变换矩阵
      fontName: 'g_d0_f1',  // 字体名称
      hasEOL: false         // 是否有行结束符
    }
    // 更多文本项...
  ],
  styles: {
    'g_d0_f1': {
      fontFamily: 'serif',
      ascent: 0.75,
      descent: -0.25,
      vertical: false
    }
    // 更多样式...
  }
}
```

## 完整示例

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { TextLayer } from 'pdfjs-dist/web/pdf_viewer'

/**
 * 渲染带文本层的PDF页面
 */
async function renderPageWithTextLayer(pdf, pageNumber, container) {
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
    
    // 获取文本内容
    const textContent = await page.getTextContent()
    
    // 创建文本层容器
    const textDiv = document.createElement('div')
    textDiv.className = 'textLayer'
    textDiv.style.position = 'absolute'
    textDiv.style.left = '0'
    textDiv.style.top = '0'
    textDiv.style.width = viewport.width + 'px'
    textDiv.style.height = viewport.height + 'px'
    container.appendChild(textDiv)
    
    // 渲染文本层
    await TextLayer.render({
      textContent,
      container: textDiv,
      viewport,
      enhanceTextSelection: true
    })
    
  } catch (error) {
    console.error('渲染文本层失败:', error)
  }
}
```

## 文本搜索功能

```javascript
/**
 * 在文本层中搜索文本
 */
function searchInTextLayer(textContent, searchTerm) {
  const results = []
  let currentIndex = 0
  
  textContent.items.forEach((item, index) => {
    const text = item.str.toLowerCase()
    const search = searchTerm.toLowerCase()
    
    let pos = text.indexOf(search)
    while (pos !== -1) {
      results.push({
        itemIndex: index,
        position: pos,
        length: search.length,
        text: item.str.substring(pos, pos + search.length)
      })
      pos = text.indexOf(search, pos + 1)
    }
  })
  
  return results
}

// 使用示例
const searchResults = searchInTextLayer(textContent, '搜索关键词')
console.log('找到', searchResults.length, '个匹配项')
```

## 文本提取

```javascript
/**
 * 提取页面的纯文本内容
 */
function extractTextFromPage(textContent) {
  let text = ''
  
  textContent.items.forEach(item => {
    text += item.str
    if (item.hasEOL) {
      text += '\n'
    }
  })
  
  return text
}

// 使用示例
const pageText = extractTextFromPage(textContent)
console.log('页面文本:', pageText)
```

## CSS 样式

文本层需要适当的 CSS 样式来正确显示：

```css
.textLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.2;
  line-height: 1.0;
}

.textLayer > span {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}

.textLayer .highlight {
  margin: -1px;
  padding: 1px;
  background-color: rgba(180, 0, 170, 0.2);
  border-radius: 4px;
}

.textLayer .highlight.begin {
  border-radius: 4px 0px 0px 4px;
}

.textLayer .highlight.end {
  border-radius: 0px 4px 4px 0px;
}

.textLayer .highlight.middle {
  border-radius: 0px;
}

.textLayer .highlight.selected {
  background-color: rgba(0, 100, 0, 0.2);
}
```

## 高级功能

### 增强文本选择

```javascript
// 启用增强文本选择功能
await TextLayer.render({
  textContent,
  container: textDiv,
  viewport,
  enhanceTextSelection: true // 提供更好的文本选择体验
})
```

### 文本高亮

```javascript
/**
 * 高亮显示搜索结果
 */
function highlightSearchResults(container, searchResults) {
  // 清除之前的高亮
  container.querySelectorAll('.highlight').forEach(el => {
    el.classList.remove('highlight')
  })
  
  // 添加新的高亮
  searchResults.forEach(result => {
    const textSpans = container.querySelectorAll('span')
    const targetSpan = textSpans[result.itemIndex]
    if (targetSpan) {
      targetSpan.classList.add('highlight')
    }
  })
}
```

## 注意事项

1. **容器定位**: 文本层容器必须使用绝对定位，并与页面内容完全对齐。

2. **透明度设置**: 通常设置文本层透明度为 0.2，使其不影响页面视觉效果。

3. **视口同步**: 文本层的视口必须与页面渲染的视口保持一致。

4. **性能考虑**: 大量文本可能影响性能，考虑按需渲染或虚拟化。

5. **字体匹配**: 确保文本层使用的字体与原始 PDF 尽可能匹配。

## 相关链接

- [AnnotationLayer API](/api/annotation-layer)
- [PDFPageProxy API](/api/pdf-page-proxy)
- [文本提取示例](/examples/text-extraction)
- [基础渲染示例](/examples/basic-rendering)