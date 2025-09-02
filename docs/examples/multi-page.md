# 多页面处理

本指南展示如何使用 PDF.js 处理多页面 PDF 文档，包括页面导航、批量渲染、缩略图生成等功能。

## 基本概念

多页面处理涉及以下核心概念：
- **页面导航**：在不同页面间切换
- **批量渲染**：同时渲染多个页面
- **缩略图**：生成页面预览图
- **虚拟滚动**：优化大文档性能
- **页面缓存**：提高渲染效率

## 基础多页面查看器

### HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
    <title>多页面 PDF 查看器</title>
    <style>
        .pdf-container {
            display: flex;
            height: 100vh;
        }
        
        .sidebar {
            width: 200px;
            background: #f5f5f5;
            border-right: 1px solid #ddd;
            overflow-y: auto;
        }
        
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .toolbar {
            padding: 10px;
            background: #fff;
            border-bottom: 1px solid #ddd;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .page-display {
            flex: 1;
            overflow: auto;
            padding: 20px;
            text-align: center;
        }
        
        .thumbnail {
            width: 150px;
            margin: 5px;
            padding: 5px;
            border: 2px solid transparent;
            cursor: pointer;
            transition: border-color 0.2s;
        }
        
        .thumbnail:hover {
            border-color: #007acc;
        }
        
        .thumbnail.active {
            border-color: #007acc;
            background: #e6f3ff;
        }
        
        .thumbnail img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .page-info {
            font-size: 12px;
            text-align: center;
            margin-top: 5px;
        }
        
        .page-canvas {
            max-width: 100%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        
        .error {
            color: #d32f2f;
            text-align: center;
            padding: 20px;
        }
        
        .page-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .page-input {
            width: 60px;
            text-align: center;
        }
        
        .zoom-controls {
            display: flex;
            align-items: center;
            gap: 5px;
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <div class="sidebar">
            <h3 style="padding: 10px; margin: 0; background: #e0e0e0;">页面缩略图</h3>
            <div id="thumbnails"></div>
        </div>
        
        <div class="main-content">
            <div class="toolbar">
                <input type="file" id="fileInput" accept=".pdf">
                
                <div class="page-controls">
                    <button id="prevPage">上一页</button>
                    <span>第</span>
                    <input type="number" id="pageInput" class="page-input" min="1" value="1">
                    <span id="pageCount">/ 0</span>
                    <span>页</span>
                    <button id="nextPage">下一页</button>
                </div>
                
                <div class="zoom-controls">
                    <button id="zoomOut">缩小</button>
                    <span id="zoomLevel">100%</span>
                    <button id="zoomIn">放大</button>
                    <button id="fitWidth">适应宽度</button>
                </div>
                
                <button id="showAllPages">显示所有页面</button>
            </div>
            
            <div class="page-display" id="pageDisplay">
                <div class="loading">请选择 PDF 文件</div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### JavaScript 实现

```javascript
/**
 * 多页面 PDF 查看器类
 */
class MultiPagePDFViewer {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.scale = 1.0;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.thumbnailCache = new Map();
        this.pageCache = new Map();
        this.showAllPages = false;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        this.fileInput = document.getElementById('fileInput');
        this.pageDisplay = document.getElementById('pageDisplay');
        this.thumbnails = document.getElementById('thumbnails');
        this.pageInput = document.getElementById('pageInput');
        this.pageCount = document.getElementById('pageCount');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.fitWidthBtn = document.getElementById('fitWidth');
        this.zoomLevel = document.getElementById('zoomLevel');
        this.showAllPagesBtn = document.getElementById('showAllPages');
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.prevPageBtn.addEventListener('click', () => this.goToPrevPage());
        this.nextPageBtn.addEventListener('click', () => this.goToNextPage());
        this.pageInput.addEventListener('change', (e) => this.goToPage(parseInt(e.target.value)));
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.fitWidthBtn.addEventListener('click', () => this.fitToWidth());
        this.showAllPagesBtn.addEventListener('click', () => this.toggleShowAllPages());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    /**
     * 处理文件选择
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            this.showLoading('正在加载 PDF...');
            
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            this.updatePageCount();
            await this.generateThumbnails();
            await this.renderPage(1);
            
            this.updateUI();
        } catch (error) {
            this.showError('加载 PDF 失败: ' + error.message);
        }
    }
    
    /**
     * 更新页面计数显示
     */
    updatePageCount() {
        const numPages = this.pdfDoc.numPages;
        this.pageCount.textContent = `/ ${numPages}`;
        this.pageInput.max = numPages;
    }
    
    /**
     * 生成所有页面的缩略图
     */
    async generateThumbnails() {
        this.thumbnails.innerHTML = '<div class="loading">生成缩略图中...</div>';
        
        const thumbnailContainer = document.createElement('div');
        const numPages = this.pdfDoc.numPages;
        
        // 批量生成缩略图
        const batchSize = 5;
        for (let i = 1; i <= numPages; i += batchSize) {
            const batch = [];
            for (let j = i; j < Math.min(i + batchSize, numPages + 1); j++) {
                batch.push(this.generateThumbnail(j));
            }
            
            const thumbnails = await Promise.all(batch);
            thumbnails.forEach(thumbnail => {
                if (thumbnail) {
                    thumbnailContainer.appendChild(thumbnail);
                }
            });
            
            // 给UI一些时间更新
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.thumbnails.innerHTML = '';
        this.thumbnails.appendChild(thumbnailContainer);
    }
    
    /**
     * 生成单个页面缩略图
     */
    async generateThumbnail(pageNum) {
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 0.2 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // 创建缩略图元素
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'thumbnail';
            thumbnailDiv.dataset.pageNum = pageNum;
            
            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            img.alt = `第 ${pageNum} 页`;
            
            const pageInfo = document.createElement('div');
            pageInfo.className = 'page-info';
            pageInfo.textContent = `第 ${pageNum} 页`;
            
            thumbnailDiv.appendChild(img);
            thumbnailDiv.appendChild(pageInfo);
            
            // 点击缩略图跳转到对应页面
            thumbnailDiv.addEventListener('click', () => {
                this.goToPage(pageNum);
            });
            
            // 缓存缩略图
            this.thumbnailCache.set(pageNum, canvas.toDataURL());
            
            return thumbnailDiv;
        } catch (error) {
            console.error(`生成第 ${pageNum} 页缩略图失败:`, error);
            return null;
        }
    }
    
    /**
     * 渲染指定页面
     */
    async renderPage(pageNum) {
        if (this.pageRendering) {
            this.pageNumPending = pageNum;
            return;
        }
        
        this.pageRendering = true;
        this.currentPage = pageNum;
        
        try {
            // 检查缓存
            const cacheKey = `${pageNum}-${this.scale}`;
            if (this.pageCache.has(cacheKey)) {
                this.displayCachedPage(cacheKey);
                this.pageRendering = false;
                return;
            }
            
            this.showLoading(`正在渲染第 ${pageNum} 页...`);
            
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = 'page-canvas';
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // 缓存页面
            this.pageCache.set(cacheKey, canvas.cloneNode(true));
            
            // 显示页面
            this.pageDisplay.innerHTML = '';
            this.pageDisplay.appendChild(canvas);
            
            this.updateUI();
            this.updateActiveThumbnail(pageNum);
            
        } catch (error) {
            this.showError(`渲染第 ${pageNum} 页失败: ${error.message}`);
        } finally {
            this.pageRendering = false;
            
            // 处理待渲染的页面
            if (this.pageNumPending !== null) {
                const pending = this.pageNumPending;
                this.pageNumPending = null;
                this.renderPage(pending);
            }
        }
    }
    
    /**
     * 显示缓存的页面
     */
    displayCachedPage(cacheKey) {
        const cachedCanvas = this.pageCache.get(cacheKey);
        this.pageDisplay.innerHTML = '';
        this.pageDisplay.appendChild(cachedCanvas.cloneNode(true));
        this.updateUI();
        this.updateActiveThumbnail(this.currentPage);
    }
    
    /**
     * 渲染所有页面（连续滚动模式）
     */
    async renderAllPages() {
        this.showLoading('正在渲染所有页面...');
        
        const container = document.createElement('div');
        const numPages = this.pdfDoc.numPages;
        
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            try {
                const page = await this.pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: this.scale });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.className = 'page-canvas';
                canvas.dataset.pageNum = pageNum;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                container.appendChild(canvas);
                
                // 添加页面分隔
                if (pageNum < numPages) {
                    const separator = document.createElement('div');
                    separator.style.height = '20px';
                    container.appendChild(separator);
                }
                
            } catch (error) {
                console.error(`渲染第 ${pageNum} 页失败:`, error);
            }
        }
        
        this.pageDisplay.innerHTML = '';
        this.pageDisplay.appendChild(container);
    }
    
    /**
     * 更新活动缩略图
     */
    updateActiveThumbnail(pageNum) {
        // 移除之前的活动状态
        const prevActive = this.thumbnails.querySelector('.thumbnail.active');
        if (prevActive) {
            prevActive.classList.remove('active');
        }
        
        // 添加当前页面的活动状态
        const currentThumbnail = this.thumbnails.querySelector(`[data-page-num="${pageNum}"]`);
        if (currentThumbnail) {
            currentThumbnail.classList.add('active');
            currentThumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    /**
     * 跳转到指定页面
     */
    async goToPage(pageNum) {
        if (!this.pdfDoc) return;
        
        const numPages = this.pdfDoc.numPages;
        if (pageNum < 1 || pageNum > numPages) return;
        
        if (!this.showAllPages) {
            await this.renderPage(pageNum);
        } else {
            // 在连续滚动模式下，滚动到指定页面
            const targetCanvas = this.pageDisplay.querySelector(`[data-page-num="${pageNum}"]`);
            if (targetCanvas) {
                targetCanvas.scrollIntoView({ behavior: 'smooth' });
                this.currentPage = pageNum;
                this.updateUI();
                this.updateActiveThumbnail(pageNum);
            }
        }
    }
    
    /**
     * 上一页
     */
    goToPrevPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    /**
     * 下一页
     */
    goToNextPage() {
        if (this.pdfDoc && this.currentPage < this.pdfDoc.numPages) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    /**
     * 放大
     */
    async zoomIn() {
        this.scale = Math.min(this.scale * 1.2, 3.0);
        await this.refreshCurrentView();
    }
    
    /**
     * 缩小
     */
    async zoomOut() {
        this.scale = Math.max(this.scale / 1.2, 0.3);
        await this.refreshCurrentView();
    }
    
    /**
     * 适应宽度
     */
    async fitToWidth() {
        if (!this.pdfDoc) return;
        
        const page = await this.pdfDoc.getPage(this.currentPage);
        const viewport = page.getViewport({ scale: 1.0 });
        const containerWidth = this.pageDisplay.clientWidth - 40; // 减去padding
        
        this.scale = containerWidth / viewport.width;
        await this.refreshCurrentView();
    }
    
    /**
     * 切换显示模式
     */
    async toggleShowAllPages() {
        this.showAllPages = !this.showAllPages;
        
        if (this.showAllPages) {
            this.showAllPagesBtn.textContent = '单页模式';
            await this.renderAllPages();
        } else {
            this.showAllPagesBtn.textContent = '显示所有页面';
            await this.renderPage(this.currentPage);
        }
    }
    
    /**
     * 刷新当前视图
     */
    async refreshCurrentView() {
        // 清除页面缓存
        this.pageCache.clear();
        
        if (this.showAllPages) {
            await this.renderAllPages();
        } else {
            await this.renderPage(this.currentPage);
        }
        
        this.updateZoomLevel();
    }
    
    /**
     * 更新缩放级别显示
     */
    updateZoomLevel() {
        this.zoomLevel.textContent = Math.round(this.scale * 100) + '%';
    }
    
    /**
     * 更新UI状态
     */
    updateUI() {
        if (!this.pdfDoc) return;
        
        this.pageInput.value = this.currentPage;
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= this.pdfDoc.numPages;
        this.updateZoomLevel();
    }
    
    /**
     * 处理键盘事件
     */
    handleKeydown(event) {
        if (!this.pdfDoc) return;
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                this.goToPrevPage();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                this.goToNextPage();
                break;
            case 'Home':
                event.preventDefault();
                this.goToPage(1);
                break;
            case 'End':
                event.preventDefault();
                this.goToPage(this.pdfDoc.numPages);
                break;
            case '+':
            case '=':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.zoomIn();
                }
                break;
            case '-':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.zoomOut();
                }
                break;
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading(message) {
        this.pageDisplay.innerHTML = `<div class="loading">${message}</div>`;
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        this.pageDisplay.innerHTML = `<div class="error">${message}</div>`;
    }
}

// 初始化应用
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const viewer = new MultiPagePDFViewer();
```

## 高级功能

### 虚拟滚动优化

对于大型PDF文档，可以实现虚拟滚动来提高性能：

```javascript
/**
 * 虚拟滚动多页面查看器
 */
class VirtualScrollPDFViewer extends MultiPagePDFViewer {
    constructor() {
        super();
        this.visiblePages = new Set();
        this.pageHeight = 800; // 估算页面高度
        this.viewportHeight = 600;
        this.scrollContainer = null;
    }
    
    /**
     * 初始化虚拟滚动
     */
    initVirtualScroll() {
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.style.height = `${this.pdfDoc.numPages * this.pageHeight}px`;
        this.scrollContainer.style.position = 'relative';
        
        this.pageDisplay.innerHTML = '';
        this.pageDisplay.appendChild(this.scrollContainer);
        
        // 监听滚动事件
        this.pageDisplay.addEventListener('scroll', () => {
            this.updateVisiblePages();
        });
        
        this.updateVisiblePages();
    }
    
    /**
     * 更新可见页面
     */
    updateVisiblePages() {
        const scrollTop = this.pageDisplay.scrollTop;
        const startPage = Math.floor(scrollTop / this.pageHeight) + 1;
        const endPage = Math.min(
            startPage + Math.ceil(this.viewportHeight / this.pageHeight) + 1,
            this.pdfDoc.numPages
        );
        
        // 渲染新的可见页面
        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            if (!this.visiblePages.has(pageNum)) {
                this.renderVirtualPage(pageNum);
                this.visiblePages.add(pageNum);
            }
        }
        
        // 移除不可见的页面
        this.visiblePages.forEach(pageNum => {
            if (pageNum < startPage || pageNum > endPage) {
                this.removeVirtualPage(pageNum);
                this.visiblePages.delete(pageNum);
            }
        });
    }
    
    /**
     * 渲染虚拟页面
     */
    async renderVirtualPage(pageNum) {
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.position = 'absolute';
            canvas.style.top = `${(pageNum - 1) * this.pageHeight}px`;
            canvas.dataset.pageNum = pageNum;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            this.scrollContainer.appendChild(canvas);
            
        } catch (error) {
            console.error(`渲染虚拟页面 ${pageNum} 失败:`, error);
        }
    }
    
    /**
     * 移除虚拟页面
     */
    removeVirtualPage(pageNum) {
        const canvas = this.scrollContainer.querySelector(`[data-page-num="${pageNum}"]`);
        if (canvas) {
            canvas.remove();
        }
    }
}
```

### 页面预加载

```javascript
/**
 * 页面预加载管理器
 */
class PagePreloader {
    constructor(pdfDoc, scale = 1.0) {
        this.pdfDoc = pdfDoc;
        this.scale = scale;
        this.preloadCache = new Map();
        this.preloadQueue = [];
        this.isPreloading = false;
    }
    
    /**
     * 预加载页面
     */
    async preloadPage(pageNum) {
        if (this.preloadCache.has(pageNum)) {
            return this.preloadCache.get(pageNum);
        }
        
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            this.preloadCache.set(pageNum, canvas);
            return canvas;
            
        } catch (error) {
            console.error(`预加载页面 ${pageNum} 失败:`, error);
            return null;
        }
    }
    
    /**
     * 批量预加载
     */
    async batchPreload(startPage, endPage) {
        const promises = [];
        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            promises.push(this.preloadPage(pageNum));
        }
        
        await Promise.all(promises);
    }
    
    /**
     * 智能预加载（预加载当前页面周围的页面）
     */
    smartPreload(currentPage, range = 2) {
        const startPage = Math.max(1, currentPage - range);
        const endPage = Math.min(this.pdfDoc.numPages, currentPage + range);
        
        this.batchPreload(startPage, endPage);
    }
    
    /**
     * 获取预加载的页面
     */
    getPreloadedPage(pageNum) {
        return this.preloadCache.get(pageNum);
    }
    
    /**
     * 清除预加载缓存
     */
    clearCache() {
        this.preloadCache.clear();
    }
}
```

## 性能优化建议

### 1. 内存管理

```javascript
// 限制缓存大小
class LimitedCache {
    constructor(maxSize = 10) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.accessOrder = [];
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            // 更新访问顺序
            const index = this.accessOrder.indexOf(key);
            this.accessOrder.splice(index, 1);
        } else if (this.cache.size >= this.maxSize) {
            // 移除最久未使用的项
            const oldest = this.accessOrder.shift();
            this.cache.delete(oldest);
        }
        
        this.cache.set(key, value);
        this.accessOrder.push(key);
    }
    
    get(key) {
        if (this.cache.has(key)) {
            // 更新访问顺序
            const index = this.accessOrder.indexOf(key);
            this.accessOrder.splice(index, 1);
            this.accessOrder.push(key);
            
            return this.cache.get(key);
        }
        return null;
    }
}
```

### 2. 渲染优化

```javascript
// 使用 Web Workers 进行后台渲染
class WorkerRenderer {
    constructor() {
        this.worker = new Worker('pdf-worker.js');
        this.renderQueue = [];
        this.isRendering = false;
    }
    
    async renderPage(pdfDoc, pageNum, scale) {
        return new Promise((resolve, reject) => {
            const taskId = Date.now() + Math.random();
            
            this.worker.postMessage({
                taskId,
                pdfDoc: pdfDoc,
                pageNum,
                scale
            });
            
            const handleMessage = (event) => {
                if (event.data.taskId === taskId) {
                    this.worker.removeEventListener('message', handleMessage);
                    
                    if (event.data.error) {
                        reject(new Error(event.data.error));
                    } else {
                        resolve(event.data.canvas);
                    }
                }
            };
            
            this.worker.addEventListener('message', handleMessage);
        });
    }
}
```

## 注意事项

1. **内存使用**：大型PDF文档可能消耗大量内存，建议实现页面缓存限制
2. **渲染性能**：避免同时渲染过多页面，使用虚拟滚动或分页加载
3. **用户体验**：提供加载指示器和进度反馈
4. **错误处理**：妥善处理页面渲染失败的情况
5. **移动端适配**：考虑触摸手势和屏幕尺寸限制

## 相关链接

- [基础渲染](/examples/basic-rendering)
- [PDF.js组件](/examples/components)
- [性能优化指南](/guide/performance)
- [PDFDocumentProxy API](/api/pdf-document-proxy)
- [PDFPageProxy API](/api/pdf-page-proxy)