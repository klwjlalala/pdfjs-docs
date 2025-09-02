# 自定义PDF查看器

本指南展示如何使用 PDF.js 构建功能完整的自定义PDF查看器，包括页面导航、缩放控制、搜索功能、书签导航等高级特性。

## 基础查看器结构

### HTML结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自定义PDF查看器</title>
    <link rel="stylesheet" href="viewer.css">
</head>
<body>
    <div id="pdf-viewer">
        <!-- 工具栏 -->
        <div class="toolbar">
            <div class="toolbar-left">
                <button id="open-file" title="打开文件">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M2 3h5l2 2h5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
                    </svg>
                </button>
                <input type="file" id="file-input" accept=".pdf" style="display: none;">
                
                <div class="separator"></div>
                
                <button id="prev-page" title="上一页" disabled>
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 12l-4-4 4-4v8z"/>
                    </svg>
                </button>
                
                <div class="page-info">
                    <input type="number" id="page-input" min="1" value="1">
                    <span>/ <span id="total-pages">0</span></span>
                </div>
                
                <button id="next-page" title="下一页" disabled>
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M6 4l4 4-4 4V4z"/>
                    </svg>
                </button>
                
                <div class="separator"></div>
                
                <button id="zoom-out" title="缩小">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M6 8h4"/>
                    </svg>
                </button>
                
                <select id="zoom-select">
                    <option value="auto">自适应</option>
                    <option value="page-fit">适合页面</option>
                    <option value="page-width">适合宽度</option>
                    <option value="0.5">50%</option>
                    <option value="0.75">75%</option>
                    <option value="1" selected>100%</option>
                    <option value="1.25">125%</option>
                    <option value="1.5">150%</option>
                    <option value="2">200%</option>
                </select>
                
                <button id="zoom-in" title="放大">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M6 8h4M8 6v4"/>
                    </svg>
                </button>
            </div>
            
            <div class="toolbar-center">
                <div class="search-box">
                    <input type="text" id="search-input" placeholder="搜索文档...">
                    <button id="search-prev" title="上一个结果" disabled>
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path d="M8 12l-4-4 4-4v8z"/>
                        </svg>
                    </button>
                    <button id="search-next" title="下一个结果" disabled>
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <path d="M6 4l4 4-4 4V4z"/>
                        </svg>
                    </button>
                    <span id="search-results"></span>
                </div>
            </div>
            
            <div class="toolbar-right">
                <button id="toggle-sidebar" title="切换侧边栏">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <rect x="2" y="3" width="12" height="10" fill="none" stroke="currentColor"/>
                        <line x1="6" y1="3" x2="6" y2="13" stroke="currentColor"/>
                    </svg>
                </button>
                
                <button id="fullscreen" title="全屏">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M2 3h3v2H3v2H1V3h1zM13 3h1v4h-2V5h-2V3h3zM3 11v2h2v2H1v-4h2zM11 13h2v-2h2v4h-4v-2z"/>
                    </svg>
                </button>
                
                <button id="download" title="下载">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8 12l-4-4h3V4h2v4h3l-4 4zM2 14h12v2H2v-2z"/>
                    </svg>
                </button>
            </div>
        </div>
        
        <!-- 主内容区域 -->
        <div class="main-content">
            <!-- 侧边栏 -->
            <div class="sidebar" id="sidebar">
                <div class="sidebar-tabs">
                    <button class="tab-button active" data-tab="outline">大纲</button>
                    <button class="tab-button" data-tab="thumbnails">缩略图</button>
                    <button class="tab-button" data-tab="attachments">附件</button>
                </div>
                
                <div class="sidebar-content">
                    <div class="tab-panel active" id="outline-panel">
                        <div id="outline-tree"></div>
                    </div>
                    
                    <div class="tab-panel" id="thumbnails-panel">
                        <div id="thumbnails-container"></div>
                    </div>
                    
                    <div class="tab-panel" id="attachments-panel">
                        <div id="attachments-list"></div>
                    </div>
                </div>
            </div>
            
            <!-- PDF内容区域 -->
            <div class="pdf-container">
                <div id="loading-indicator" class="loading">
                    <div class="spinner"></div>
                    <span>加载中...</span>
                </div>
                
                <div id="pdf-viewer-container">
                    <div id="pdf-pages"></div>
                </div>
                
                <div id="error-message" class="error" style="display: none;">
                    <h3>加载失败</h3>
                    <p id="error-text"></p>
                    <button id="retry-button">重试</button>
                </div>
            </div>
        </div>
        
        <!-- 状态栏 -->
        <div class="status-bar">
            <div class="status-left">
                <span id="document-info"></span>
            </div>
            <div class="status-right">
                <span id="zoom-info">100%</span>
            </div>
        </div>
    </div>
</body>
<script src="custom-viewer.js"></script>
</html>
```

### JavaScript实现

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { PDFLinkService, PDFViewer } from 'pdfjs-dist/web/pdf_viewer'

/**
 * 自定义PDF查看器类
 */
class CustomPDFViewer {
  constructor(container) {
    this.container = container
    this.pdf = null
    this.currentPage = 1
    this.totalPages = 0
    this.scale = 1.0
    this.rotation = 0
    this.searchResults = []
    this.currentSearchIndex = -1
    this.isLoading = false
    
    // DOM元素引用
    this.elements = {
      fileInput: container.querySelector('#file-input'),
      openFile: container.querySelector('#open-file'),
      prevPage: container.querySelector('#prev-page'),
      nextPage: container.querySelector('#next-page'),
      pageInput: container.querySelector('#page-input'),
      totalPagesSpan: container.querySelector('#total-pages'),
      zoomOut: container.querySelector('#zoom-out'),
      zoomIn: container.querySelector('#zoom-in'),
      zoomSelect: container.querySelector('#zoom-select'),
      searchInput: container.querySelector('#search-input'),
      searchPrev: container.querySelector('#search-prev'),
      searchNext: container.querySelector('#search-next'),
      searchResults: container.querySelector('#search-results'),
      toggleSidebar: container.querySelector('#toggle-sidebar'),
      fullscreen: container.querySelector('#fullscreen'),
      download: container.querySelector('#download'),
      sidebar: container.querySelector('#sidebar'),
      pdfPages: container.querySelector('#pdf-pages'),
      loadingIndicator: container.querySelector('#loading-indicator'),
      errorMessage: container.querySelector('#error-message'),
      errorText: container.querySelector('#error-text'),
      retryButton: container.querySelector('#retry-button'),
      documentInfo: container.querySelector('#document-info'),
      zoomInfo: container.querySelector('#zoom-info'),
      outlineTree: container.querySelector('#outline-tree'),
      thumbnailsContainer: container.querySelector('#thumbnails-container'),
      attachmentsList: container.querySelector('#attachments-list')
    }
    
    this.initializeEventListeners()
    this.initializePDFJS()
  }
  
  /**
   * 初始化PDF.js
   */
  initializePDFJS() {
    // 设置Worker路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  
  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    // 文件操作
    this.elements.openFile.addEventListener('click', () => {
      this.elements.fileInput.click()
    })
    
    this.elements.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file && file.type === 'application/pdf') {
        this.loadPDFFromFile(file)
      }
    })
    
    // 页面导航
    this.elements.prevPage.addEventListener('click', () => {
      this.goToPage(this.currentPage - 1)
    })
    
    this.elements.nextPage.addEventListener('click', () => {
      this.goToPage(this.currentPage + 1)
    })
    
    this.elements.pageInput.addEventListener('change', (e) => {
      const pageNum = parseInt(e.target.value)
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        this.goToPage(pageNum)
      } else {
        e.target.value = this.currentPage
      }
    })
    
    // 缩放控制
    this.elements.zoomOut.addEventListener('click', () => {
      this.zoomOut()
    })
    
    this.elements.zoomIn.addEventListener('click', () => {
      this.zoomIn()
    })
    
    this.elements.zoomSelect.addEventListener('change', (e) => {
      this.setZoom(e.target.value)
    })
    
    // 搜索功能
    this.elements.searchInput.addEventListener('input', (e) => {
      this.debounceSearch(e.target.value)
    })
    
    this.elements.searchPrev.addEventListener('click', () => {
      this.searchPrevious()
    })
    
    this.elements.searchNext.addEventListener('click', () => {
      this.searchNext()
    })
    
    // 界面控制
    this.elements.toggleSidebar.addEventListener('click', () => {
      this.toggleSidebar()
    })
    
    this.elements.fullscreen.addEventListener('click', () => {
      this.toggleFullscreen()
    })
    
    this.elements.download.addEventListener('click', () => {
      this.downloadPDF()
    })
    
    // 侧边栏标签
    this.container.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchSidebarTab(e.target.dataset.tab)
      })
    })
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e)
    })
    
    // 拖拽支持
    this.setupDragAndDrop()
    
    // 重试按钮
    this.elements.retryButton.addEventListener('click', () => {
      this.retryLoad()
    })
  }
  
  /**
   * 从文件加载PDF
   */
  async loadPDFFromFile(file) {
    this.showLoading(true)
    this.hideError()
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      await this.loadPDF(arrayBuffer)
      this.currentFile = file
    } catch (error) {
      this.showError('加载PDF文件失败: ' + error.message)
    } finally {
      this.showLoading(false)
    }
  }
  
  /**
   * 从URL加载PDF
   */
  async loadPDFFromURL(url) {
    this.showLoading(true)
    this.hideError()
    
    try {
      await this.loadPDF(url)
      this.currentURL = url
    } catch (error) {
      this.showError('加载PDF失败: ' + error.message)
    } finally {
      this.showLoading(false)
    }
  }
  
  /**
   * 加载PDF文档
   */
  async loadPDF(source) {
    try {
      const loadingTask = pdfjsLib.getDocument(source)
      
      // 监听加载进度
      loadingTask.onProgress = (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100)
          this.updateLoadingProgress(percent)
        }
      }
      
      this.pdf = await loadingTask.promise
      this.totalPages = this.pdf.numPages
      
      // 更新UI
      this.elements.totalPagesSpan.textContent = this.totalPages
      this.elements.pageInput.max = this.totalPages
      
      // 获取文档信息
      await this.loadDocumentInfo()
      
      // 加载大纲
      await this.loadOutline()
      
      // 加载附件
      await this.loadAttachments()
      
      // 渲染第一页
      await this.goToPage(1)
      
      // 生成缩略图
      this.generateThumbnails()
      
      console.log('PDF加载完成，共', this.totalPages, '页')
      
    } catch (error) {
      console.error('加载PDF失败:', error)
      throw error
    }
  }
  
  /**
   * 加载文档信息
   */
  async loadDocumentInfo() {
    try {
      const metadata = await this.pdf.getMetadata()
      const info = metadata.info
      
      let infoText = ''
      if (info.Title) infoText += info.Title
      if (info.Author) infoText += (infoText ? ' - ' : '') + info.Author
      if (!infoText) infoText = `PDF文档 (${this.totalPages}页)`
      
      this.elements.documentInfo.textContent = infoText
      
      // 设置页面标题
      if (info.Title) {
        document.title = info.Title + ' - PDF查看器'
      }
      
    } catch (error) {
      console.warn('获取文档信息失败:', error)
      this.elements.documentInfo.textContent = `PDF文档 (${this.totalPages}页)`
    }
  }
  
  /**
   * 加载文档大纲
   */
  async loadOutline() {
    try {
      const outline = await this.pdf.getOutline()
      this.renderOutline(outline)
    } catch (error) {
      console.warn('获取文档大纲失败:', error)
      this.elements.outlineTree.innerHTML = '<p class="no-content">无大纲信息</p>'
    }
  }
  
  /**
   * 渲染文档大纲
   */
  renderOutline(outline) {
    if (!outline || outline.length === 0) {
      this.elements.outlineTree.innerHTML = '<p class="no-content">无大纲信息</p>'
      return
    }
    
    const createOutlineItem = (item, level = 0) => {
      const div = document.createElement('div')
      div.className = 'outline-item'
      div.style.paddingLeft = (level * 20) + 'px'
      
      const title = document.createElement('span')
      title.className = 'outline-title'
      title.textContent = item.title
      title.addEventListener('click', () => {
        this.navigateToDestination(item.dest)
      })
      
      div.appendChild(title)
      
      if (item.items && item.items.length > 0) {
        const toggle = document.createElement('span')
        toggle.className = 'outline-toggle'
        toggle.textContent = '▼'
        div.insertBefore(toggle, title)
        
        const children = document.createElement('div')
        children.className = 'outline-children'
        
        item.items.forEach(child => {
          children.appendChild(createOutlineItem(child, level + 1))
        })
        
        div.appendChild(children)
        
        toggle.addEventListener('click', (e) => {
          e.stopPropagation()
          children.style.display = children.style.display === 'none' ? 'block' : 'none'
          toggle.textContent = children.style.display === 'none' ? '▶' : '▼'
        })
      }
      
      return div
    }
    
    this.elements.outlineTree.innerHTML = ''
    outline.forEach(item => {
      this.elements.outlineTree.appendChild(createOutlineItem(item))
    })
  }
  
  /**
   * 导航到指定目标
   */
  async navigateToDestination(dest) {
    if (!dest) return
    
    try {
      const destination = await this.pdf.getDestination(dest)
      if (destination) {
        const pageRef = destination[0]
        const pageIndex = await this.pdf.getPageIndex(pageRef)
        this.goToPage(pageIndex + 1)
      }
    } catch (error) {
      console.warn('导航到目标失败:', error)
    }
  }
  
  /**
   * 加载附件
   */
  async loadAttachments() {
    try {
      const attachments = await this.pdf.getAttachments()
      this.renderAttachments(attachments)
    } catch (error) {
      console.warn('获取附件失败:', error)
      this.elements.attachmentsList.innerHTML = '<p class="no-content">无附件</p>'
    }
  }
  
  /**
   * 渲染附件列表
   */
  renderAttachments(attachments) {
    if (!attachments || Object.keys(attachments).length === 0) {
      this.elements.attachmentsList.innerHTML = '<p class="no-content">无附件</p>'
      return
    }
    
    this.elements.attachmentsList.innerHTML = ''
    
    Object.entries(attachments).forEach(([name, attachment]) => {
      const item = document.createElement('div')
      item.className = 'attachment-item'
      
      const icon = document.createElement('span')
      icon.className = 'attachment-icon'
      icon.textContent = '📎'
      
      const nameSpan = document.createElement('span')
      nameSpan.className = 'attachment-name'
      nameSpan.textContent = name
      
      const sizeSpan = document.createElement('span')
      sizeSpan.className = 'attachment-size'
      sizeSpan.textContent = this.formatFileSize(attachment.content.length)
      
      const downloadBtn = document.createElement('button')
      downloadBtn.className = 'attachment-download'
      downloadBtn.textContent = '下载'
      downloadBtn.addEventListener('click', () => {
        this.downloadAttachment(name, attachment)
      })
      
      item.appendChild(icon)
      item.appendChild(nameSpan)
      item.appendChild(sizeSpan)
      item.appendChild(downloadBtn)
      
      this.elements.attachmentsList.appendChild(item)
    })
  }
  
  /**
   * 下载附件
   */
  downloadAttachment(name, attachment) {
    const blob = new Blob([attachment.content], {
      type: attachment.filename ? 'application/octet-stream' : 'text/plain'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    
    URL.revokeObjectURL(url)
  }
  
  /**
   * 生成缩略图
   */
  async generateThumbnails() {
    this.elements.thumbnailsContainer.innerHTML = ''
    
    for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
      const thumbnailDiv = document.createElement('div')
      thumbnailDiv.className = 'thumbnail-item'
      thumbnailDiv.dataset.page = pageNum
      
      const canvas = document.createElement('canvas')
      const pageLabel = document.createElement('div')
      pageLabel.className = 'thumbnail-label'
      pageLabel.textContent = `第 ${pageNum} 页`
      
      thumbnailDiv.appendChild(canvas)
      thumbnailDiv.appendChild(pageLabel)
      
      thumbnailDiv.addEventListener('click', () => {
        this.goToPage(pageNum)
      })
      
      this.elements.thumbnailsContainer.appendChild(thumbnailDiv)
      
      // 异步渲染缩略图
      this.renderThumbnail(pageNum, canvas)
    }
  }
  
  /**
   * 渲染单个缩略图
   */
  async renderThumbnail(pageNum, canvas) {
    try {
      const page = await this.pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 0.2 })
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      const context = canvas.getContext('2d')
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
    } catch (error) {
      console.warn(`渲染第${pageNum}页缩略图失败:`, error)
    }
  }
  
  /**
   * 跳转到指定页面
   */
  async goToPage(pageNum) {
    if (pageNum < 1 || pageNum > this.totalPages || pageNum === this.currentPage) {
      return
    }
    
    this.currentPage = pageNum
    
    // 更新UI状态
    this.elements.pageInput.value = pageNum
    this.elements.prevPage.disabled = pageNum <= 1
    this.elements.nextPage.disabled = pageNum >= this.totalPages
    
    // 更新缩略图选中状态
    this.updateThumbnailSelection(pageNum)
    
    // 渲染页面
    await this.renderCurrentPage()
  }
  
  /**
   * 渲染当前页面
   */
  async renderCurrentPage() {
    try {
      const page = await this.pdf.getPage(this.currentPage)
      const viewport = page.getViewport({ 
        scale: this.scale, 
        rotation: this.rotation 
      })
      
      // 清空页面容器
      this.elements.pdfPages.innerHTML = ''
      
      // 创建页面容器
      const pageDiv = document.createElement('div')
      pageDiv.className = 'pdf-page'
      pageDiv.style.width = viewport.width + 'px'
      pageDiv.style.height = viewport.height + 'px'
      
      // 创建canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      pageDiv.appendChild(canvas)
      this.elements.pdfPages.appendChild(pageDiv)
      
      // 渲染页面
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
      
      // 渲染文本层（用于搜索和选择）
      await this.renderTextLayer(page, pageDiv, viewport)
      
      // 渲染注释层
      await this.renderAnnotationLayer(page, pageDiv, viewport)
      
    } catch (error) {
      console.error('渲染页面失败:', error)
      this.showError('渲染页面失败: ' + error.message)
    }
  }
  
  /**
   * 渲染文本层
   */
  async renderTextLayer(page, pageDiv, viewport) {
    try {
      const textContent = await page.getTextContent()
      
      const textLayerDiv = document.createElement('div')
      textLayerDiv.className = 'textLayer'
      textLayerDiv.style.width = viewport.width + 'px'
      textLayerDiv.style.height = viewport.height + 'px'
      
      pageDiv.appendChild(textLayerDiv)
      
      // 使用PDF.js的文本层渲染器
      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport: viewport
      })
      
      await textLayer.render()
      
    } catch (error) {
      console.warn('渲染文本层失败:', error)
    }
  }
  
  /**
   * 渲染注释层
   */
  async renderAnnotationLayer(page, pageDiv, viewport) {
    try {
      const annotations = await page.getAnnotations()
      
      if (annotations.length === 0) return
      
      const annotationLayerDiv = document.createElement('div')
      annotationLayerDiv.className = 'annotationLayer'
      annotationLayerDiv.style.width = viewport.width + 'px'
      annotationLayerDiv.style.height = viewport.height + 'px'
      
      pageDiv.appendChild(annotationLayerDiv)
      
      // 渲染注释
      annotations.forEach(annotation => {
        const element = this.createAnnotationElement(annotation, viewport)
        if (element) {
          annotationLayerDiv.appendChild(element)
        }
      })
      
    } catch (error) {
      console.warn('渲染注释层失败:', error)
    }
  }
  
  /**
   * 创建注释元素
   */
  createAnnotationElement(annotation, viewport) {
    const rect = viewport.convertToViewportRectangle(annotation.rect)
    const [x1, y1, x2, y2] = rect
    
    const element = document.createElement('div')
    element.className = 'annotation'
    element.style.position = 'absolute'
    element.style.left = Math.min(x1, x2) + 'px'
    element.style.top = Math.min(y1, y2) + 'px'
    element.style.width = Math.abs(x2 - x1) + 'px'
    element.style.height = Math.abs(y2 - y1) + 'px'
    
    // 根据注释类型设置样式和行为
    switch (annotation.subtype) {
      case 'Link':
        element.className += ' annotation-link'
        element.style.cursor = 'pointer'
        element.addEventListener('click', () => {
          this.handleLinkAnnotation(annotation)
        })
        break
        
      case 'Text':
        element.className += ' annotation-text'
        element.title = annotation.contents || ''
        break
        
      case 'Highlight':
        element.className += ' annotation-highlight'
        element.style.backgroundColor = 'rgba(255, 255, 0, 0.3)'
        break
    }
    
    return element
  }
  
  /**
   * 处理链接注释
   */
  handleLinkAnnotation(annotation) {
    if (annotation.url) {
      window.open(annotation.url, '_blank')
    } else if (annotation.dest) {
      this.navigateToDestination(annotation.dest)
    }
  }
  
  /**
   * 搜索功能
   */
  debounceSearch = this.debounce((query) => {
    this.performSearch(query)
  }, 300)
  
  /**
   * 执行搜索
   */
  async performSearch(query) {
    if (!query.trim()) {
      this.clearSearchResults()
      return
    }
    
    this.searchResults = []
    this.currentSearchIndex = -1
    
    try {
      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        const page = await this.pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .toLowerCase()
        
        const searchQuery = query.toLowerCase()
        let index = 0
        
        while ((index = pageText.indexOf(searchQuery, index)) !== -1) {
          this.searchResults.push({
            pageNum,
            index,
            text: query
          })
          index += searchQuery.length
        }
      }
      
      this.updateSearchUI()
      
      if (this.searchResults.length > 0) {
        this.currentSearchIndex = 0
        this.highlightSearchResult()
      }
      
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }
  
  /**
   * 更新搜索UI
   */
  updateSearchUI() {
    const count = this.searchResults.length
    const current = this.currentSearchIndex + 1
    
    if (count === 0) {
      this.elements.searchResults.textContent = '无结果'
    } else {
      this.elements.searchResults.textContent = `${current}/${count}`
    }
    
    this.elements.searchPrev.disabled = count === 0 || this.currentSearchIndex <= 0
    this.elements.searchNext.disabled = count === 0 || this.currentSearchIndex >= count - 1
  }
  
  /**
   * 搜索上一个
   */
  searchPrevious() {
    if (this.currentSearchIndex > 0) {
      this.currentSearchIndex--
      this.highlightSearchResult()
      this.updateSearchUI()
    }
  }
  
  /**
   * 搜索下一个
   */
  searchNext() {
    if (this.currentSearchIndex < this.searchResults.length - 1) {
      this.currentSearchIndex++
      this.highlightSearchResult()
      this.updateSearchUI()
    }
  }
  
  /**
   * 高亮搜索结果
   */
  highlightSearchResult() {
    if (this.currentSearchIndex < 0 || this.currentSearchIndex >= this.searchResults.length) {
      return
    }
    
    const result = this.searchResults[this.currentSearchIndex]
    this.goToPage(result.pageNum)
  }
  
  /**
   * 清除搜索结果
   */
  clearSearchResults() {
    this.searchResults = []
    this.currentSearchIndex = -1
    this.updateSearchUI()
  }
  
  /**
   * 缩放控制
   */
  zoomIn() {
    this.setZoom(Math.min(this.scale * 1.25, 5.0))
  }
  
  zoomOut() {
    this.setZoom(Math.max(this.scale / 1.25, 0.1))
  }
  
  /**
   * 设置缩放
   */
  async setZoom(value) {
    if (typeof value === 'string') {
      switch (value) {
        case 'auto':
          this.fitToContainer()
          return
        case 'page-fit':
          this.fitToPage()
          return
        case 'page-width':
          this.fitToWidth()
          return
        default:
          value = parseFloat(value)
      }
    }
    
    if (isNaN(value) || value <= 0) return
    
    this.scale = value
    this.elements.zoomSelect.value = value.toString()
    this.elements.zoomInfo.textContent = Math.round(value * 100) + '%'
    
    await this.renderCurrentPage()
  }
  
  /**
   * 适应容器
   */
  async fitToContainer() {
    // 实现自适应逻辑
    const containerWidth = this.elements.pdfPages.clientWidth
    const containerHeight = this.elements.pdfPages.clientHeight
    
    if (this.pdf && this.currentPage) {
      const page = await this.pdf.getPage(this.currentPage)
      const viewport = page.getViewport({ scale: 1.0 })
      
      const scaleX = containerWidth / viewport.width
      const scaleY = containerHeight / viewport.height
      const scale = Math.min(scaleX, scaleY) * 0.9 // 留一些边距
      
      this.setZoom(scale)
    }
  }
  
  /**
   * 适应页面
   */
  async fitToPage() {
    await this.fitToContainer()
  }
  
  /**
   * 适应宽度
   */
  async fitToWidth() {
    const containerWidth = this.elements.pdfPages.clientWidth
    
    if (this.pdf && this.currentPage) {
      const page = await this.pdf.getPage(this.currentPage)
      const viewport = page.getViewport({ scale: 1.0 })
      
      const scale = (containerWidth / viewport.width) * 0.95 // 留一些边距
      this.setZoom(scale)
    }
  }
  
  /**
   * 切换侧边栏
   */
  toggleSidebar() {
    this.elements.sidebar.classList.toggle('hidden')
  }
  
  /**
   * 切换侧边栏标签
   */
  switchSidebarTab(tabName) {
    // 更新标签按钮状态
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName)
    })
    
    // 更新面板显示
    this.container.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName + '-panel')
    })
  }
  
  /**
   * 切换全屏
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }
  
  /**
   * 下载PDF
   */
  downloadPDF() {
    if (this.currentFile) {
      const url = URL.createObjectURL(this.currentFile)
      const a = document.createElement('a')
      a.href = url
      a.download = this.currentFile.name
      a.click()
      URL.revokeObjectURL(url)
    } else if (this.currentURL) {
      window.open(this.currentURL, '_blank')
    }
  }
  
  /**
   * 键盘快捷键处理
   */
  handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT') return
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault()
        this.goToPage(this.currentPage - 1)
        break
        
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault()
        this.goToPage(this.currentPage + 1)
        break
        
      case 'Home':
        e.preventDefault()
        this.goToPage(1)
        break
        
      case 'End':
        e.preventDefault()
        this.goToPage(this.totalPages)
        break
        
      case '+':
      case '=':
        if (e.ctrlKey) {
          e.preventDefault()
          this.zoomIn()
        }
        break
        
      case '-':
        if (e.ctrlKey) {
          e.preventDefault()
          this.zoomOut()
        }
        break
        
      case '0':
        if (e.ctrlKey) {
          e.preventDefault()
          this.setZoom(1.0)
        }
        break
        
      case 'f':
        if (e.ctrlKey) {
          e.preventDefault()
          this.elements.searchInput.focus()
        }
        break
        
      case 'F11':
        e.preventDefault()
        this.toggleFullscreen()
        break
    }
  }
  
  /**
   * 设置拖拽支持
   */
  setupDragAndDrop() {
    const dropZone = this.container
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault()
      dropZone.classList.add('drag-over')
    })
    
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault()
      dropZone.classList.remove('drag-over')
    })
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault()
      dropZone.classList.remove('drag-over')
      
      const files = e.dataTransfer.files
      if (files.length > 0 && files[0].type === 'application/pdf') {
        this.loadPDFFromFile(files[0])
      }
    })
  }
  
  /**
   * 显示/隐藏加载指示器
   */
  showLoading(show) {
    this.elements.loadingIndicator.style.display = show ? 'flex' : 'none'
    this.isLoading = show
  }
  
  /**
   * 更新加载进度
   */
  updateLoadingProgress(percent) {
    const indicator = this.elements.loadingIndicator.querySelector('span')
    indicator.textContent = `加载中... ${percent}%`
  }
  
  /**
   * 显示错误信息
   */
  showError(message) {
    this.elements.errorText.textContent = message
    this.elements.errorMessage.style.display = 'block'
  }
  
  /**
   * 隐藏错误信息
   */
  hideError() {
    this.elements.errorMessage.style.display = 'none'
  }
  
  /**
   * 重试加载
   */
  retryLoad() {
    if (this.currentFile) {
      this.loadPDFFromFile(this.currentFile)
    } else if (this.currentURL) {
      this.loadPDFFromURL(this.currentURL)
    }
  }
  
  /**
   * 更新缩略图选中状态
   */
  updateThumbnailSelection(pageNum) {
    this.container.querySelectorAll('.thumbnail-item').forEach(item => {
      item.classList.toggle('selected', parseInt(item.dataset.page) === pageNum)
    })
  }
  
  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

// 初始化查看器
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pdf-viewer')
  const viewer = new CustomPDFViewer(container)
  
  // 如果URL中有PDF参数，自动加载
  const urlParams = new URLSearchParams(window.location.search)
  const pdfUrl = urlParams.get('pdf')
  if (pdfUrl) {
    viewer.loadPDFFromURL(pdfUrl)
  }
  
  // 暴露到全局作用域以便调试
  window.pdfViewer = viewer
})
```

## CSS样式

```css
/* viewer.css */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  overflow: hidden;
}

#pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #2c3e50;
  color: white;
  border-bottom: 1px solid #34495e;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar button {
  background: transparent;
  border: 1px solid #34495e;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar button:hover:not(:disabled) {
  background: #34495e;
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar select,
.toolbar input[type="number"] {
  background: #34495e;
  border: 1px solid #4a5f7a;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.toolbar input[type="number"] {
  width: 60px;
  text-align: center;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.separator {
  width: 1px;
  height: 20px;
  background: #34495e;
  margin: 0 4px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #34495e;
  border-radius: 4px;
  padding: 4px;
}

.search-box input {
  background: transparent;
  border: none;
  color: white;
  padding: 4px 8px;
  width: 200px;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #bdc3c7;
}

.search-box input:focus {
  outline: none;
}

#search-results {
  font-size: 11px;
  color: #bdc3c7;
  min-width: 40px;
  text-align: center;
}

/* 主内容区域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 300px;
  background: #ecf0f1;
  border-right: 1px solid #bdc3c7;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar.hidden {
  width: 0;
  overflow: hidden;
}

.sidebar-tabs {
  display: flex;
  background: #d5dbdb;
  border-bottom: 1px solid #bdc3c7;
}

.tab-button {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #2c3e50;
}

.tab-button.active {
  background: #ecf0f1;
  border-bottom: 2px solid #3498db;
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
  display: none;
}

.tab-panel.active {
  display: block;
}

.no-content {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin-top: 20px;
}

/* 大纲样式 */
.outline-item {
  margin: 2px 0;
  cursor: pointer;
}

.outline-toggle {
  display: inline-block;
  width: 16px;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.outline-title {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
}

.outline-title:hover {
  background: #d5dbdb;
}

.outline-children {
  margin-left: 16px;
}

/* 缩略图样式 */
.thumbnail-item {
  margin: 8px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 4px;
}

.thumbnail-item:hover {
  border-color: #3498db;
}

.thumbnail-item.selected {
  border-color: #e74c3c;
  background: #fdf2f2;
}

.thumbnail-item canvas {
  display: block;
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thumbnail-label {
  font-size: 11px;
  color: #7f8c8d;
  margin-top: 4px;
}

/* 附件样式 */
.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #d5dbdb;
  font-size: 12px;
}

.attachment-icon {
  font-size: 16px;
}

.attachment-name {
  flex: 1;
  font-weight: 500;
}

.attachment-size {
  color: #7f8c8d;
  font-size: 11px;
}

.attachment-download {
  background: #3498db;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.attachment-download:hover {
  background: #2980b9;
}

/* PDF内容区域 */
.pdf-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

#pdf-viewer-container {
  flex: 1;
  overflow: auto;
  background: #f8f9fa;
}

#pdf-pages {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.pdf-page {
  position: relative;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: white;
}

/* 文本层样式 */
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

.textLayer .highlight.selected {
  background-color: rgba(0, 100, 0, 0.2);
}

/* 注释层样式 */
.annotationLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.annotation {
  position: absolute;
}

.annotation-link {
  border: 1px solid rgba(255, 255, 0, 0.4);
  background: rgba(255, 255, 0, 0.1);
}

.annotation-link:hover {
  background: rgba(255, 255, 0, 0.2);
}

.annotation-text {
  background: rgba(255, 255, 0, 0.3);
}

.annotation-highlight {
  mix-blend-mode: multiply;
}

/* 加载和错误状态 */
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #7f8c8d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #e74c3c;
  background: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error h3 {
  margin-bottom: 16px;
  font-size: 18px;
}

.error p {
  margin-bottom: 16px;
  color: #7f8c8d;
}

.error button {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.error button:hover {
  background: #2980b9;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px;
  background: #ecf0f1;
  border-top: 1px solid #bdc3c7;
  font-size: 12px;
  color: #7f8c8d;
  flex-shrink: 0;
}

/* 拖拽样式 */
.drag-over {
  border: 2px dashed #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.drag-over::after {
  content: '拖拽PDF文件到此处';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #3498db;
  pointer-events: none;
  z-index: 1000;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 250px;
  }
  
  .toolbar {
    padding: 4px 8px;
  }
  
  .toolbar-center {
    display: none;
  }
  
  .search-box input {
    width: 150px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    position: absolute;
    left: -300px;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transition: left 0.3s ease;
  }
  
  .sidebar.show {
    left: 0;
  }
  
  .toolbar-left .separator {
    display: none;
  }
  
  .page-info span {
    display: none;
  }
}
```

## 使用示例

```html
<!-- 基本使用 -->
<script>
  // 加载PDF文件
  const viewer = new CustomPDFViewer(document.getElementById('pdf-viewer'))
  viewer.loadPDFFromURL('/path/to/document.pdf')
</script>

<!-- 带参数的URL加载 -->
<script>
  // 从URL参数加载PDF
  const urlParams = new URLSearchParams(window.location.search)
  const pdfUrl = urlParams.get('pdf')
  if (pdfUrl) {
    viewer.loadPDFFromURL(decodeURIComponent(pdfUrl))
  }
</script>

<!-- 文件上传处理 -->
<script>
  document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      viewer.loadPDFFromFile(file)
    } else {
      alert('请选择有效的PDF文件')
    }
  })
</script>
```

## 高级功能

### 自定义工具栏

```javascript
/**
 * 扩展工具栏功能
 */
class ExtendedPDFViewer extends CustomPDFViewer {
  constructor(container) {
    super(container)
    this.addCustomTools()
  }
  
  /**
   * 添加自定义工具
   */
  addCustomTools() {
    const toolbar = this.container.querySelector('.toolbar-right')
    
    // 添加打印按钮
    const printBtn = document.createElement('button')
    printBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M4 2h8v2H4V2zM2 6h12v6H2V6zm2 8h8v2H4v-2z"/>
      </svg>
    `
    printBtn.title = '打印'
    printBtn.addEventListener('click', () => this.printPDF())
    
    // 添加旋转按钮
    const rotateBtn = document.createElement('button')
    rotateBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M8 2a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8v2zm0 12a6 6 0 0 1-6-6H0a8 8 0 0 0 8 8v-2z"/>
      </svg>
    `
    rotateBtn.title = '旋转'
    rotateBtn.addEventListener('click', () => this.rotatePage())
    
    toolbar.insertBefore(printBtn, toolbar.firstChild)
    toolbar.insertBefore(rotateBtn, toolbar.firstChild)
  }
  
  /**
   * 打印PDF
   */
  async printPDF() {
    if (!this.pdf) return
    
    try {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>打印PDF</title>
            <style>
              body { margin: 0; }
              .page { page-break-after: always; text-align: center; }
              .page:last-child { page-break-after: avoid; }
              canvas { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
      `)
      
      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        const page = await this.pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise
        
        printWindow.document.write(`
          <div class="page">
            <img src="${canvas.toDataURL()}" />
          </div>
        `)
      }
      
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
      
    } catch (error) {
      console.error('打印失败:', error)
      alert('打印失败: ' + error.message)
    }
  }
  
  /**
   * 旋转页面
   */
  async rotatePage() {
    this.rotation = (this.rotation + 90) % 360
    await this.renderCurrentPage()
  }
}
```

### 批注功能

```javascript
/**
 * 带批注功能的PDF查看器
 */
class AnnotationPDFViewer extends CustomPDFViewer {
  constructor(container) {
    super(container)
    this.annotations = new Map() // 存储自定义批注
    this.isAnnotationMode = false
    this.currentTool = 'select'
    this.setupAnnotationTools()
  }
  
  /**
   * 设置批注工具
   */
  setupAnnotationTools() {
    const toolbar = this.container.querySelector('.toolbar-left')
    
    // 添加批注工具栏
    const annotationToolbar = document.createElement('div')
    annotationToolbar.className = 'annotation-toolbar'
    annotationToolbar.innerHTML = `
      <button id="annotation-toggle" title="批注模式">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M2 2h12v8H6l-2 2-2-2H2V2z"/>
        </svg>
      </button>
      <div class="annotation-tools" style="display: none;">
        <button data-tool="highlight" title="高亮">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="2" y="6" width="12" height="4" fill="yellow" opacity="0.7"/>
          </svg>
        </button>
        <button data-tool="note" title="便签">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="3" y="3" width="10" height="10" fill="none" stroke="currentColor"/>
            <path d="M6 6h4M6 8h4M6 10h2"/>
          </svg>
        </button>
        <button data-tool="arrow" title="箭头">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M2 8l6-6v4h6v4h-6v4l-6-6z"/>
          </svg>
        </button>
      </div>
    `
    
    toolbar.appendChild(annotationToolbar)
    
    // 绑定事件
    const toggleBtn = annotationToolbar.querySelector('#annotation-toggle')
    const toolsDiv = annotationToolbar.querySelector('.annotation-tools')
    
    toggleBtn.addEventListener('click', () => {
      this.isAnnotationMode = !this.isAnnotationMode
      toolsDiv.style.display = this.isAnnotationMode ? 'flex' : 'none'
      toggleBtn.classList.toggle('active', this.isAnnotationMode)
    })
    
    toolsDiv.querySelectorAll('[data-tool]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentTool = e.target.closest('[data-tool]').dataset.tool
        toolsDiv.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      })
    })
  }
  
  /**
   * 重写页面渲染以支持批注
   */
  async renderCurrentPage() {
    await super.renderCurrentPage()
    
    if (this.isAnnotationMode) {
      this.setupPageAnnotationEvents()
    }
    
    // 渲染已有批注
    this.renderPageAnnotations()
  }
  
  /**
   * 设置页面批注事件
   */
  setupPageAnnotationEvents() {
    const pageDiv = this.elements.pdfPages.querySelector('.pdf-page')
    if (!pageDiv) return
    
    let isDrawing = false
    let startPos = null
    
    pageDiv.addEventListener('mousedown', (e) => {
      if (!this.isAnnotationMode) return
      
      isDrawing = true
      startPos = { x: e.offsetX, y: e.offsetY }
      
      if (this.currentTool === 'note') {
        this.createNoteAnnotation(startPos)
      }
    })
    
    pageDiv.addEventListener('mousemove', (e) => {
      if (!isDrawing || !startPos) return
      
      const currentPos = { x: e.offsetX, y: e.offsetY }
      
      if (this.currentTool === 'highlight') {
        this.updateHighlightPreview(startPos, currentPos)
      }
    })
    
    pageDiv.addEventListener('mouseup', (e) => {
      if (!isDrawing || !startPos) return
      
      const endPos = { x: e.offsetX, y: e.offsetY }
      
      if (this.currentTool === 'highlight') {
        this.createHighlightAnnotation(startPos, endPos)
      } else if (this.currentTool === 'arrow') {
        this.createArrowAnnotation(startPos, endPos)
      }
      
      isDrawing = false
      startPos = null
    })
  }
  
  /**
   * 创建高亮批注
   */
  createHighlightAnnotation(start, end) {
    const annotation = {
      id: Date.now().toString(),
      type: 'highlight',
      page: this.currentPage,
      rect: {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y)
      },
      color: '#ffff00',
      opacity: 0.5
    }
    
    this.addAnnotation(annotation)
  }
  
  /**
   * 创建便签批注
   */
  createNoteAnnotation(pos) {
    const text = prompt('请输入便签内容:')
    if (!text) return
    
    const annotation = {
      id: Date.now().toString(),
      type: 'note',
      page: this.currentPage,
      position: pos,
      text: text,
      color: '#ffd700'
    }
    
    this.addAnnotation(annotation)
  }
  
  /**
   * 创建箭头批注
   */
  createArrowAnnotation(start, end) {
    const annotation = {
      id: Date.now().toString(),
      type: 'arrow',
      page: this.currentPage,
      start: start,
      end: end,
      color: '#ff0000',
      width: 2
    }
    
    this.addAnnotation(annotation)
  }
  
  /**
   * 添加批注
   */
  addAnnotation(annotation) {
    if (!this.annotations.has(annotation.page)) {
      this.annotations.set(annotation.page, [])
    }
    
    this.annotations.get(annotation.page).push(annotation)
    this.renderPageAnnotations()
    this.saveAnnotations()
  }
  
  /**
   * 渲染页面批注
   */
  renderPageAnnotations() {
    const pageDiv = this.elements.pdfPages.querySelector('.pdf-page')
    if (!pageDiv) return
    
    // 清除现有批注层
    const existingLayer = pageDiv.querySelector('.custom-annotation-layer')
    if (existingLayer) {
      existingLayer.remove()
    }
    
    const annotations = this.annotations.get(this.currentPage)
    if (!annotations || annotations.length === 0) return
    
    // 创建批注层
    const annotationLayer = document.createElement('div')
    annotationLayer.className = 'custom-annotation-layer'
    annotationLayer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `
    
    annotations.forEach(annotation => {
      const element = this.createAnnotationElement(annotation)
      if (element) {
        annotationLayer.appendChild(element)
      }
    })
    
    pageDiv.appendChild(annotationLayer)
  }
  
  /**
   * 创建批注元素
   */
  createAnnotationElement(annotation) {
    const element = document.createElement('div')
    element.className = `custom-annotation annotation-${annotation.type}`
    element.dataset.id = annotation.id
    
    switch (annotation.type) {
      case 'highlight':
        element.style.cssText = `
          position: absolute;
          left: ${annotation.rect.x}px;
          top: ${annotation.rect.y}px;
          width: ${annotation.rect.width}px;
          height: ${annotation.rect.height}px;
          background: ${annotation.color};
          opacity: ${annotation.opacity};
          pointer-events: auto;
          cursor: pointer;
        `
        break
        
      case 'note':
        element.innerHTML = '📝'
        element.style.cssText = `
          position: absolute;
          left: ${annotation.position.x}px;
          top: ${annotation.position.y}px;
          width: 20px;
          height: 20px;
          background: ${annotation.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
          pointer-events: auto;
        `
        element.title = annotation.text
        break
        
      case 'arrow':
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        
        svg.style.cssText = `
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          pointer-events: auto;
        `
        
        line.setAttribute('x1', annotation.start.x)
        line.setAttribute('y1', annotation.start.y)
        line.setAttribute('x2', annotation.end.x)
        line.setAttribute('y2', annotation.end.y)
        line.setAttribute('stroke', annotation.color)
        line.setAttribute('stroke-width', annotation.width)
        line.setAttribute('marker-end', 'url(#arrowhead)')
        
        marker.innerHTML = `
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="${annotation.color}" />
          </marker>
        `
        
        svg.appendChild(marker)
        svg.appendChild(line)
        element.appendChild(svg)
        break
    }
    
    // 添加删除功能
    element.addEventListener('dblclick', (e) => {
      e.stopPropagation()
      if (confirm('确定要删除这个批注吗？')) {
        this.removeAnnotation(annotation.id)
      }
    })
    
    return element
  }
  
  /**
   * 删除批注
   */
  removeAnnotation(annotationId) {
    for (const [page, annotations] of this.annotations.entries()) {
      const index = annotations.findIndex(a => a.id === annotationId)
      if (index !== -1) {
        annotations.splice(index, 1)
        if (annotations.length === 0) {
          this.annotations.delete(page)
        }
        break
      }
    }
    
    this.renderPageAnnotations()
    this.saveAnnotations()
  }
  
  /**
   * 保存批注到本地存储
   */
  saveAnnotations() {
    const data = {
      annotations: Object.fromEntries(this.annotations),
      timestamp: Date.now()
    }
    
    localStorage.setItem('pdf-annotations', JSON.stringify(data))
  }
  
  /**
   * 加载批注
   */
  loadAnnotations() {
    try {
      const data = localStorage.getItem('pdf-annotations')
      if (data) {
        const parsed = JSON.parse(data)
        this.annotations = new Map(Object.entries(parsed.annotations))
      }
    } catch (error) {
      console.warn('加载批注失败:', error)
    }
  }
}
```

## 性能优化

### 虚拟滚动

```javascript
/**
 * 支持虚拟滚动的大文档查看器
 */
class VirtualScrollPDFViewer extends CustomPDFViewer {
  constructor(container) {
    super(container)
    this.visiblePages = new Set()
    this.pageHeight = 800 // 估算页面高度
    this.viewportHeight = 0
    this.scrollTop = 0
    this.setupVirtualScroll()
  }
  
  /**
   * 设置虚拟滚动
   */
  setupVirtualScroll() {
    const container = this.elements.pdfPages.parentElement
    
    container.addEventListener('scroll', () => {
      this.scrollTop = container.scrollTop
      this.updateVisiblePages()
    })
    
    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      this.viewportHeight = container.clientHeight
      this.updateVisiblePages()
    })
    
    resizeObserver.observe(container)
  }
  
  /**
   * 更新可见页面
   */
  updateVisiblePages() {
    if (!this.pdf) return
    
    const startPage = Math.max(1, Math.floor(this.scrollTop / this.pageHeight))
    const endPage = Math.min(
      this.totalPages,
      Math.ceil((this.scrollTop + this.viewportHeight) / this.pageHeight) + 1
    )
    
    const newVisiblePages = new Set()
    for (let i = startPage; i <= endPage; i++) {
      newVisiblePages.add(i)
    }
    
    // 渲染新的可见页面
    for (const pageNum of newVisiblePages) {
      if (!this.visiblePages.has(pageNum)) {
        this.renderPage(pageNum)
      }
    }
    
    // 清理不可见页面
    for (const pageNum of this.visiblePages) {
      if (!newVisiblePages.has(pageNum)) {
        this.unrenderPage(pageNum)
      }
    }
    
    this.visiblePages = newVisiblePages
  }
  
  /**
   * 渲染指定页面
   */
  async renderPage(pageNum) {
    try {
      const page = await this.pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: this.scale })
      
      // 创建页面容器
      const pageDiv = document.createElement('div')
      pageDiv.className = 'pdf-page'
      pageDiv.dataset.page = pageNum
      pageDiv.style.cssText = `
        position: absolute;
        top: ${(pageNum - 1) * this.pageHeight}px;
        left: 50%;
        transform: translateX(-50%);
        width: ${viewport.width}px;
        height: ${viewport.height}px;
      `
      
      // 创建canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      pageDiv.appendChild(canvas)
      this.elements.pdfPages.appendChild(pageDiv)
      
      // 渲染页面
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      
      // 更新实际页面高度
      this.pageHeight = Math.max(this.pageHeight, viewport.height + 20)
      
    } catch (error) {
      console.error(`渲染第${pageNum}页失败:`, error)
    }
  }
  
  /**
   * 卸载指定页面
   */
  unrenderPage(pageNum) {
    const pageDiv = this.elements.pdfPages.querySelector(`[data-page="${pageNum}"]`)
    if (pageDiv) {
      pageDiv.remove()
    }
  }
}
```

## 注意事项

1. **性能考虑**：大文档建议使用虚拟滚动或分页加载
2. **内存管理**：及时清理不需要的页面渲染
3. **错误处理**：提供友好的错误提示和重试机制
4. **响应式设计**：确保在不同设备上的良好体验
5. **无障碍访问**：添加适当的ARIA标签和键盘导航

## 相关链接

- [PDF.js API文档](../api/index.md)
- [基础渲染示例](./basic-rendering.md)
- [文本提取示例](./text-extraction.md)
- [注释处理示例](./annotations.md)