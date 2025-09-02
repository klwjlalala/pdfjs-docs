# AnnotationEditorLayer

`AnnotationEditorLayer` 是 PDF.js 中用于创建和编辑 PDF 注释的交互层组件。它提供了一个可视化的编辑界面，允许用户直接在 PDF 页面上添加、修改和删除各种类型的注释。

## 概述

注释编辑器层是 PDF.js 的高级功能，它在现有的注释层之上提供了编辑能力。用户可以通过鼠标和键盘操作来创建文本注释、高亮、形状等各种注释元素。

## 主要方法

### constructor(options)

创建注释编辑器层实例。

**参数**:
- `options` (Object): 配置选项
  - `uiManager` (AnnotationEditorUIManager): UI 管理器实例
  - `div` (HTMLElement): 编辑器层容器元素
  - `annotationStorage` (AnnotationStorage): 注释存储对象
  - `pageIndex` (number): 页面索引
  - `l10n` (IL10n, 可选): 本地化对象

```javascript
import { AnnotationEditorLayer, AnnotationEditorUIManager } from 'pdfjs-dist/web/pdf_viewer'

// 创建 UI 管理器
const uiManager = new AnnotationEditorUIManager()

// 创建编辑器层容器
const editorDiv = document.createElement('div')
editorDiv.className = 'annotationEditorLayer'
container.appendChild(editorDiv)

// 创建编辑器层实例
const editorLayer = new AnnotationEditorLayer({
  uiManager,
  div: editorDiv,
  annotationStorage,
  pageIndex: 0
})
```

### render(parameters)

渲染注释编辑器层。

**参数**:
- `parameters` (Object): 渲染参数
  - `viewport` (PageViewport): 页面视口对象
  - `intent` (string, 可选): 渲染意图，默认 'display'

```javascript
const viewport = page.getViewport({ scale: 1.0 })

await editorLayer.render({
  viewport,
  intent: 'display'
})
```

### update(parameters)

更新编辑器层。

**参数**:
- `parameters` (Object): 更新参数
  - `viewport` (PageViewport): 新的页面视口对象

```javascript
const newViewport = page.getViewport({ scale: 2.0 })

editorLayer.update({
  viewport: newViewport
})
```

### setEditingState(isEditing)

设置编辑状态。

**参数**:
- `isEditing` (boolean): 是否处于编辑状态

```javascript
// 启用编辑模式
editorLayer.setEditingState(true)

// 禁用编辑模式
editorLayer.setEditingState(false)
```

### addNewEditor(editor)

添加新的注释编辑器。

**参数**:
- `editor` (AnnotationEditor): 注释编辑器实例

```javascript
// 添加文本编辑器
const textEditor = new FreeTextEditor({
  parent: editorLayer,
  id: 'text_' + Date.now(),
  rect: [100, 100, 300, 150]
})

editorLayer.addNewEditor(textEditor)
```

## 编辑器类型

### 自由文本编辑器 (FreeTextEditor)

```javascript
import { FreeTextEditor } from 'pdfjs-dist/web/pdf_viewer'

// 创建文本编辑器
const textEditor = new FreeTextEditor({
  parent: editorLayer,
  id: 'freetext_1',
  rect: [100, 200, 300, 250],
  data: {
    defaultAppearanceData: {
      fontSize: 12,
      fontColor: new Uint8ClampedArray([0, 0, 0]),
      fontName: 'Helvetica'
    },
    textContent: '输入文本内容'
  }
})
```

### 墨迹编辑器 (InkEditor)

```javascript
import { InkEditor } from 'pdfjs-dist/web/pdf_viewer'

// 创建墨迹编辑器
const inkEditor = new InkEditor({
  parent: editorLayer,
  id: 'ink_1',
  rect: [50, 50, 250, 200],
  data: {
    paths: [
      {
        bezier: [[100, 100], [150, 120], [200, 100]],
        points: [[100, 100], [150, 120], [200, 100]]
      }
    ],
    rect: [50, 50, 250, 200],
    rotation: 0
  }
})
```

## 完整示例

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { 
  AnnotationEditorLayer, 
  AnnotationEditorUIManager,
  FreeTextEditor,
  InkEditor
} from 'pdfjs-dist/web/pdf_viewer'

/**
 * 创建带编辑功能的PDF查看器
 */
class PDFEditorViewer {
  constructor(container) {
    this.container = container
    this.pdf = null
    this.currentPage = 1
    this.editorLayers = new Map()
    
    // 创建 UI 管理器
    this.uiManager = new AnnotationEditorUIManager()
    this.annotationStorage = new Map()
    
    this.setupUI()
  }
  
  /**
   * 设置用户界面
   */
  setupUI() {
    // 创建工具栏
    this.toolbar = document.createElement('div')
    this.toolbar.className = 'editor-toolbar'
    this.container.appendChild(this.toolbar)
    
    // 添加编辑工具按钮
    this.addToolbarButtons()
    
    // 创建页面容器
    this.pageContainer = document.createElement('div')
    this.pageContainer.className = 'page-container'
    this.container.appendChild(this.pageContainer)
  }
  
  /**
   * 添加工具栏按钮
   */
  addToolbarButtons() {
    const tools = [
      { name: 'select', label: '选择', action: () => this.setTool('select') },
      { name: 'freetext', label: '文本', action: () => this.setTool('freetext') },
      { name: 'ink', label: '画笔', action: () => this.setTool('ink') },
      { name: 'save', label: '保存', action: () => this.saveAnnotations() },
      { name: 'clear', label: '清除', action: () => this.clearAnnotations() }
    ]
    
    tools.forEach(tool => {
      const button = document.createElement('button')
      button.textContent = tool.label
      button.className = 'tool-button'
      button.dataset.tool = tool.name
      button.addEventListener('click', tool.action)
      this.toolbar.appendChild(button)
    })
  }
  
  /**
   * 加载PDF文档
   */
  async loadPDF(url) {
    try {
      this.pdf = await pdfjsLib.getDocument(url).promise
      await this.renderPage(1)
    } catch (error) {
      console.error('加载PDF失败:', error)
    }
  }
  
  /**
   * 渲染页面
   */
  async renderPage(pageNumber) {
    try {
      const page = await this.pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1.0 })
      
      // 清空容器
      this.pageContainer.innerHTML = ''
      
      // 创建页面容器
      const pageDiv = document.createElement('div')
      pageDiv.className = 'pdf-page'
      pageDiv.style.position = 'relative'
      pageDiv.style.width = viewport.width + 'px'
      pageDiv.style.height = viewport.height + 'px'
      this.pageContainer.appendChild(pageDiv)
      
      // 渲染页面内容
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      pageDiv.appendChild(canvas)
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      await page.render(renderContext).promise
      
      // 创建编辑器层
      const editorDiv = document.createElement('div')
      editorDiv.className = 'annotationEditorLayer'
      editorDiv.style.position = 'absolute'
      editorDiv.style.left = '0'
      editorDiv.style.top = '0'
      editorDiv.style.width = viewport.width + 'px'
      editorDiv.style.height = viewport.height + 'px'
      pageDiv.appendChild(editorDiv)
      
      // 创建编辑器层实例
      const editorLayer = new AnnotationEditorLayer({
        uiManager: this.uiManager,
        div: editorDiv,
        annotationStorage: this.annotationStorage,
        pageIndex: pageNumber - 1
      })
      
      await editorLayer.render({ viewport })
      
      // 保存编辑器层引用
      this.editorLayers.set(pageNumber, editorLayer)
      this.currentPage = pageNumber
      
      // 设置事件监听
      this.setupPageEvents(pageDiv, editorLayer)
      
    } catch (error) {
      console.error('渲染页面失败:', error)
    }
  }
  
  /**
   * 设置页面事件监听
   */
  setupPageEvents(pageDiv, editorLayer) {
    let isDrawing = false
    let currentEditor = null
    
    pageDiv.addEventListener('mousedown', (event) => {
      if (this.currentTool === 'freetext') {
        this.createTextEditor(event, editorLayer)
      } else if (this.currentTool === 'ink') {
        isDrawing = true
        currentEditor = this.createInkEditor(event, editorLayer)
      }
    })
    
    pageDiv.addEventListener('mousemove', (event) => {
      if (isDrawing && currentEditor) {
        this.updateInkEditor(event, currentEditor)
      }
    })
    
    pageDiv.addEventListener('mouseup', () => {
      isDrawing = false
      currentEditor = null
    })
  }
  
  /**
   * 创建文本编辑器
   */
  createTextEditor(event, editorLayer) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const textEditor = new FreeTextEditor({
      parent: editorLayer,
      id: 'freetext_' + Date.now(),
      rect: [x, y, x + 200, y + 50],
      data: {
        defaultAppearanceData: {
          fontSize: 12,
          fontColor: new Uint8ClampedArray([0, 0, 0]),
          fontName: 'Helvetica'
        },
        textContent: '点击编辑文本'
      }
    })
    
    editorLayer.addNewEditor(textEditor)
  }
  
  /**
   * 创建墨迹编辑器
   */
  createInkEditor(event, editorLayer) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const inkEditor = new InkEditor({
      parent: editorLayer,
      id: 'ink_' + Date.now(),
      rect: [x - 10, y - 10, x + 10, y + 10],
      data: {
        paths: [{
          bezier: [[x, y]],
          points: [[x, y]]
        }],
        rect: [x - 10, y - 10, x + 10, y + 10],
        rotation: 0
      }
    })
    
    editorLayer.addNewEditor(inkEditor)
    return inkEditor
  }
  
  /**
   * 更新墨迹编辑器
   */
  updateInkEditor(event, inkEditor) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 添加新的点到路径
    const path = inkEditor.data.paths[0]
    path.points.push([x, y])
    path.bezier.push([x, y])
    
    // 更新编辑器
    inkEditor.rebuild()
  }
  
  /**
   * 设置当前工具
   */
  setTool(toolName) {
    this.currentTool = toolName
    
    // 更新工具栏状态
    this.toolbar.querySelectorAll('.tool-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === toolName)
    })
    
    // 设置编辑状态
    const isEditing = toolName !== 'select'
    this.editorLayers.forEach(layer => {
      layer.setEditingState(isEditing)
    })
  }
  
  /**
   * 保存注释
   */
  async saveAnnotations() {
    try {
      const annotations = []
      
      this.editorLayers.forEach((layer, pageIndex) => {
        const pageAnnotations = layer.getAnnotations()
        annotations.push(...pageAnnotations)
      })
      
      console.log('保存注释:', annotations)
      
      // 这里可以实现保存到服务器的逻辑
      // await this.saveToServer(annotations)
      
      alert('注释已保存')
    } catch (error) {
      console.error('保存注释失败:', error)
    }
  }
  
  /**
   * 清除所有注释
   */
  clearAnnotations() {
    if (confirm('确定要清除所有注释吗？')) {
      this.editorLayers.forEach(layer => {
        layer.clear()
      })
      this.annotationStorage.clear()
    }
  }
}

// 使用示例
const container = document.getElementById('pdf-container')
const viewer = new PDFEditorViewer(container)
viewer.loadPDF('/path/to/document.pdf')
```

## CSS 样式

```css
.annotationEditorLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.annotationEditorLayer.editing {
  pointer-events: auto;
}

.annotationEditor {
  position: absolute;
  cursor: move;
  border: 1px dashed #007acc;
  background: rgba(0, 122, 204, 0.1);
}

.annotationEditor:hover {
  border-color: #005a9e;
}

.annotationEditor.selected {
  border: 2px solid #007acc;
  background: rgba(0, 122, 204, 0.2);
}

.freeTextEditor {
  min-width: 100px;
  min-height: 30px;
  padding: 4px;
}

.freeTextEditor textarea {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
}

.inkEditor {
  pointer-events: none;
}

.inkEditor svg {
  width: 100%;
  height: 100%;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.tool-button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.tool-button:hover {
  background: #f0f0f0;
}

.tool-button.active {
  background: #007acc;
  color: white;
  border-color: #005a9e;
}
```

## 注意事项

1. **权限控制**: 确保用户有编辑PDF的权限。

2. **数据持久化**: 编辑的注释需要保存到适当的存储中。

3. **性能优化**: 大量注释可能影响性能，考虑虚拟化。

4. **兼容性**: 某些浏览器可能不完全支持所有编辑功能。

5. **撤销/重做**: 考虑实现操作历史管理。

## 相关链接

- [AnnotationEditorUIManager API](/api/annotation-editor-ui-manager)
- [AnnotationLayer API](/api/annotation-layer)
- [高级功能示例](/examples/advanced-features)
- [注释处理示例](/examples/annotations)