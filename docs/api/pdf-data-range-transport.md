# PDFDataRangeTransport

`PDFDataRangeTransport` 是 PDF.js 中用于处理分块数据传输的抽象类。它提供了一种机制来按需加载 PDF 数据的特定范围，特别适用于大型 PDF 文件的流式加载和网络优化。

## 概述

`PDFDataRangeTransport` 主要用于：
- 实现 PDF 数据的分块加载
- 支持 HTTP Range 请求
- 优化大文件的加载性能
- 提供自定义数据传输机制
- 支持流式 PDF 处理

## 基本用法

### 创建自定义传输类

```javascript
class CustomPDFDataRangeTransport extends pdfjsLib.PDFDataRangeTransport {
    constructor(length, initialData, progressiveDone = false) {
        super(length, initialData, progressiveDone);
        this.url = null;
        this.cache = new Map();
    }
    
    /**
     * 请求数据范围
     */
    requestRange(begin, end) {
        return new Promise((resolve, reject) => {
            // 检查缓存
            const cacheKey = `${begin}-${end}`;
            if (this.cache.has(cacheKey)) {
                const data = this.cache.get(cacheKey);
                this.onDataRange(begin, data);
                resolve();
                return;
            }
            
            // 发起 HTTP Range 请求
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.url);
            xhr.setRequestHeader('Range', `bytes=${begin}-${end - 1}`);
            xhr.responseType = 'arraybuffer';
            
            xhr.onload = () => {
                if (xhr.status === 206 || xhr.status === 200) {
                    const data = new Uint8Array(xhr.response);
                    this.cache.set(cacheKey, data);
                    this.onDataRange(begin, data);
                    resolve();
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('网络请求失败'));
            xhr.send();
        });
    }
    
    /**
     * 中止传输
     */
    abort() {
        // 清理资源
        this.cache.clear();
        super.abort();
    }
}
```

## 主要方法

### constructor(length, initialData, progressiveDone)

创建一个新的数据传输实例。

**参数：**
- `length` (number): 数据总长度
- `initialData` (Uint8Array): 初始数据
- `progressiveDone` (boolean): 是否支持渐进式加载

```javascript
const transport = new CustomPDFDataRangeTransport(
    fileSize,
    initialChunk,
    true // 支持渐进式加载
);
```

### requestRange(begin, end)

请求指定范围的数据。这是一个抽象方法，需要在子类中实现。

**参数：**
- `begin` (number): 开始位置
- `end` (number): 结束位置

```javascript
requestRange(begin, end) {
    // 实现数据范围请求逻辑
    return this.fetchDataRange(begin, end)
        .then(data => this.onDataRange(begin, data));
}
```

### onDataRange(begin, chunk)

当数据范围可用时调用此方法。

**参数：**
- `begin` (number): 数据开始位置
- `chunk` (Uint8Array): 数据块

```javascript
onDataRange(begin, chunk) {
    // 通知 PDF.js 数据已可用
    super.onDataRange(begin, chunk);
    
    // 可以添加自定义处理逻辑
    this.updateProgress(begin, chunk.length);
}
```

### onDataProgress(loaded)

报告数据加载进度。

**参数：**
- `loaded` (number): 已加载的字节数

```javascript
onDataProgress(loaded) {
    const progress = (loaded / this.length) * 100;
    console.log(`加载进度: ${progress.toFixed(1)}%`);
    
    // 触发进度事件
    this.dispatchEvent(new CustomEvent('progress', {
        detail: { loaded, total: this.length, progress }
    }));
}
```

### abort()

中止数据传输。

```javascript
abort() {
    this.aborted = true;
    // 清理资源
    this.cleanup();
}
```

## 完整示例

以下是一个完整的流式 PDF 加载示例：

```html
<!DOCTYPE html>
<html>
<head>
    <title>PDF.js 流式加载示例</title>
    <style>
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .controls {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .progress-container {
            margin: 15px 0;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #007acc, #4fc3f7);
            transition: width 0.3s ease;
            width: 0%;
        }
        
        .progress-text {
            text-align: center;
            margin-top: 5px;
            font-size: 14px;
            color: #666;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-item {
            background: white;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
            text-align: center;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #007acc;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .viewer-container {
            border: 1px solid #ccc;
            border-radius: 4px;
            min-height: 600px;
            background: #f9f9f9;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .pdf-canvas {
            max-width: 100%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .btn {
            padding: 10px 20px;
            border: 1px solid #ccc;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
            font-size: 14px;
        }
        
        .btn.primary {
            background: #007acc;
            color: white;
            border-color: #007acc;
        }
        
        .btn:hover {
            background: #f0f0f0;
        }
        
        .btn.primary:hover {
            background: #005a9e;
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .log-panel {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PDF.js 流式加载示例</h1>
        
        <div class="controls">
            <div>
                <label for="pdfUrl">PDF URL:</label>
                <input type="text" id="pdfUrl" placeholder="输入 PDF 文件 URL" style="width: 400px; margin: 0 10px;">
                <button id="loadBtn" class="btn primary">加载 PDF</button>
                <button id="abortBtn" class="btn" disabled>中止加载</button>
            </div>
            
            <div class="progress-container">
                <div class="progress-bar">
                    <div id="progressFill" class="progress-fill"></div>
                </div>
                <div id="progressText" class="progress-text">等待加载...</div>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div id="totalSize" class="stat-value">0</div>
                    <div class="stat-label">文件大小 (MB)</div>
                </div>
                <div class="stat-item">
                    <div id="loadedSize" class="stat-value">0</div>
                    <div class="stat-label">已加载 (MB)</div>
                </div>
                <div class="stat-item">
                    <div id="requestCount" class="stat-value">0</div>
                    <div class="stat-label">请求次数</div>
                </div>
                <div class="stat-item">
                    <div id="cacheHits" class="stat-value">0</div>
                    <div class="stat-label">缓存命中</div>
                </div>
            </div>
        </div>
        
        <div class="viewer-container">
            <canvas id="pdfCanvas" class="pdf-canvas"></canvas>
        </div>
        
        <div id="logPanel" class="log-panel"></div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        /**
         * 流式 PDF 数据传输类
         */
        class StreamingPDFDataRangeTransport extends pdfjsLib.PDFDataRangeTransport {
            constructor(url, length, initialData) {
                super(length, initialData, true);
                this.url = url;
                this.cache = new Map();
                this.requestCount = 0;
                this.cacheHits = 0;
                this.loadedBytes = initialData ? initialData.length : 0;
                this.aborted = false;
                
                // 事件监听器
                this.progressListeners = [];
                this.errorListeners = [];
            }
            
            /**
             * 请求数据范围
             */
            async requestRange(begin, end) {
                if (this.aborted) {
                    throw new Error('传输已中止');
                }
                
                const cacheKey = `${begin}-${end}`;
                
                // 检查缓存
                if (this.cache.has(cacheKey)) {
                    this.cacheHits++;
                    const data = this.cache.get(cacheKey);
                    this.onDataRange(begin, data);
                    this.log(`缓存命中: ${begin}-${end} (${data.length} 字节)`);
                    return;
                }
                
                this.requestCount++;
                this.log(`请求范围: ${begin}-${end} (${end - begin} 字节)`);
                
                try {
                    const data = await this.fetchRange(begin, end);
                    
                    if (!this.aborted) {
                        this.cache.set(cacheKey, data);
                        this.loadedBytes += data.length;
                        this.onDataRange(begin, data);
                        this.onDataProgress(this.loadedBytes);
                        this.log(`接收数据: ${begin}-${end} (${data.length} 字节)`);
                    }
                } catch (error) {
                    this.log(`请求失败: ${error.message}`, 'error');
                    this.notifyError(error);
                    throw error;
                }
            }
            
            /**
             * 获取数据范围
             */
            fetchRange(begin, end) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', this.url);
                    xhr.setRequestHeader('Range', `bytes=${begin}-${end - 1}`);
                    xhr.responseType = 'arraybuffer';
                    
                    xhr.onload = () => {
                        if (xhr.status === 206 || xhr.status === 200) {
                            resolve(new Uint8Array(xhr.response));
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                        }
                    };
                    
                    xhr.onerror = () => reject(new Error('网络请求失败'));
                    xhr.ontimeout = () => reject(new Error('请求超时'));
                    
                    xhr.timeout = 30000; // 30秒超时
                    xhr.send();
                });
            }
            
            /**
             * 中止传输
             */
            abort() {
                this.aborted = true;
                this.cache.clear();
                this.log('传输已中止');
                super.abort();
            }
            
            /**
             * 添加进度监听器
             */
            onProgress(callback) {
                this.progressListeners.push(callback);
            }
            
            /**
             * 添加错误监听器
             */
            onError(callback) {
                this.errorListeners.push(callback);
            }
            
            /**
             * 通知进度更新
             */
            onDataProgress(loaded) {
                const progress = (loaded / this.length) * 100;
                this.progressListeners.forEach(callback => {
                    callback({ loaded, total: this.length, progress });
                });
            }
            
            /**
             * 通知错误
             */
            notifyError(error) {
                this.errorListeners.forEach(callback => {
                    callback(error);
                });
            }
            
            /**
             * 记录日志
             */
            log(message, type = 'info') {
                const timestamp = new Date().toLocaleTimeString();
                const prefix = type === 'error' ? '[ERROR]' : '[INFO]';
                console.log(`${timestamp} ${prefix} ${message}`);
                
                // 更新日志面板
                const logPanel = document.getElementById('logPanel');
                if (logPanel) {
                    logPanel.textContent += `${timestamp} ${prefix} ${message}\n`;
                    logPanel.scrollTop = logPanel.scrollHeight;
                }
            }
            
            /**
             * 获取统计信息
             */
            getStats() {
                return {
                    totalSize: this.length,
                    loadedSize: this.loadedBytes,
                    requestCount: this.requestCount,
                    cacheHits: this.cacheHits,
                    cacheSize: this.cache.size,
                    progress: (this.loadedBytes / this.length) * 100
                };
            }
        }
        
        /**
         * PDF 流式加载器
         */
        class StreamingPDFLoader {
            constructor() {
                this.transport = null;
                this.pdf = null;
                this.canvas = document.getElementById('pdfCanvas');
                this.ctx = this.canvas.getContext('2d');
                
                this.initializeElements();
                this.bindEvents();
            }
            
            /**
             * 初始化DOM元素
             */
            initializeElements() {
                this.urlInput = document.getElementById('pdfUrl');
                this.loadBtn = document.getElementById('loadBtn');
                this.abortBtn = document.getElementById('abortBtn');
                this.progressFill = document.getElementById('progressFill');
                this.progressText = document.getElementById('progressText');
                this.totalSizeEl = document.getElementById('totalSize');
                this.loadedSizeEl = document.getElementById('loadedSize');
                this.requestCountEl = document.getElementById('requestCount');
                this.cacheHitsEl = document.getElementById('cacheHits');
                
                // 设置默认URL
                this.urlInput.value = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
            }
            
            /**
             * 绑定事件监听器
             */
            bindEvents() {
                this.loadBtn.addEventListener('click', () => {
                    this.loadPDF();
                });
                
                this.abortBtn.addEventListener('click', () => {
                    this.abortLoading();
                });
            }
            
            /**
             * 加载 PDF
             */
            async loadPDF() {
                const url = this.urlInput.value.trim();
                if (!url) {
                    alert('请输入 PDF URL');
                    return;
                }
                
                try {
                    this.setLoadingState(true);
                    this.clearStats();
                    
                    // 获取文件信息
                    const fileInfo = await this.getFileInfo(url);
                    this.log(`文件信息: 大小 ${(fileInfo.length / 1024 / 1024).toFixed(2)} MB`);
                    
                    // 创建传输对象
                    this.transport = new StreamingPDFDataRangeTransport(
                        url,
                        fileInfo.length,
                        fileInfo.initialData
                    );
                    
                    // 设置事件监听器
                    this.transport.onProgress((progress) => {
                        this.updateProgress(progress);
                        this.updateStats();
                    });
                    
                    this.transport.onError((error) => {
                        this.log(`传输错误: ${error.message}`, 'error');
                    });
                    
                    // 加载 PDF 文档
                    const loadingTask = pdfjsLib.getDocument({
                        range: this.transport
                    });
                    
                    this.pdf = await loadingTask.promise;
                    this.log(`PDF 加载完成: ${this.pdf.numPages} 页`);
                    
                    // 渲染第一页
                    await this.renderPage(1);
                    
                } catch (error) {
                    this.log(`加载失败: ${error.message}`, 'error');
                    alert(`加载失败: ${error.message}`);
                } finally {
                    this.setLoadingState(false);
                }
            }
            
            /**
             * 获取文件信息
             */
            async getFileInfo(url) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('HEAD', url);
                    
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            const length = parseInt(xhr.getResponseHeader('Content-Length'));
                            if (length) {
                                resolve({ length, initialData: null });
                            } else {
                                reject(new Error('无法获取文件大小'));
                            }
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                        }
                    };
                    
                    xhr.onerror = () => reject(new Error('网络请求失败'));
                    xhr.send();
                });
            }
            
            /**
             * 渲染页面
             */
            async renderPage(pageNum) {
                if (!this.pdf) return;
                
                try {
                    const page = await this.pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.5 });
                    
                    this.canvas.width = viewport.width;
                    this.canvas.height = viewport.height;
                    
                    const renderContext = {
                        canvasContext: this.ctx,
                        viewport: viewport
                    };
                    
                    await page.render(renderContext).promise;
                    this.log(`页面 ${pageNum} 渲染完成`);
                    
                } catch (error) {
                    this.log(`渲染失败: ${error.message}`, 'error');
                }
            }
            
            /**
             * 中止加载
             */
            abortLoading() {
                if (this.transport) {
                    this.transport.abort();
                    this.transport = null;
                }
                
                if (this.pdf) {
                    this.pdf.destroy();
                    this.pdf = null;
                }
                
                this.setLoadingState(false);
                this.log('加载已中止');
            }
            
            /**
             * 设置加载状态
             */
            setLoadingState(loading) {
                this.loadBtn.disabled = loading;
                this.abortBtn.disabled = !loading;
                
                if (!loading) {
                    this.progressFill.style.width = '0%';
                    this.progressText.textContent = '等待加载...';
                }
            }
            
            /**
             * 更新进度
             */
            updateProgress(progress) {
                this.progressFill.style.width = `${progress.progress}%`;
                this.progressText.textContent = 
                    `${progress.progress.toFixed(1)}% (${(progress.loaded / 1024 / 1024).toFixed(2)} MB / ${(progress.total / 1024 / 1024).toFixed(2)} MB)`;
            }
            
            /**
             * 更新统计信息
             */
            updateStats() {
                if (!this.transport) return;
                
                const stats = this.transport.getStats();
                this.totalSizeEl.textContent = (stats.totalSize / 1024 / 1024).toFixed(2);
                this.loadedSizeEl.textContent = (stats.loadedSize / 1024 / 1024).toFixed(2);
                this.requestCountEl.textContent = stats.requestCount;
                this.cacheHitsEl.textContent = stats.cacheHits;
            }
            
            /**
             * 清除统计信息
             */
            clearStats() {
                this.totalSizeEl.textContent = '0';
                this.loadedSizeEl.textContent = '0';
                this.requestCountEl.textContent = '0';
                this.cacheHitsEl.textContent = '0';
                
                // 清除日志
                document.getElementById('logPanel').textContent = '';
            }
            
            /**
             * 记录日志
             */
            log(message, type = 'info') {
                const timestamp = new Date().toLocaleTimeString();
                const prefix = type === 'error' ? '[ERROR]' : '[INFO]';
                console.log(`${timestamp} ${prefix} ${message}`);
                
                const logPanel = document.getElementById('logPanel');
                logPanel.textContent += `${timestamp} ${prefix} ${message}\n`;
                logPanel.scrollTop = logPanel.scrollHeight;
            }
        }
        
        // 设置 PDF.js Worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // 初始化加载器
        const loader = new StreamingPDFLoader();
    </script>
</body>
</html>
```

## 高级功能

### 智能缓存策略

```javascript
class SmartCachingTransport extends pdfjsLib.PDFDataRangeTransport {
    constructor(url, length, initialData) {
        super(length, initialData, true);
        this.url = url;
        this.cache = new Map();
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB 缓存限制
        this.cacheStats = { hits: 0, misses: 0 };
    }
    
    /**
     * 智能缓存管理
     */
    manageCache(newDataSize) {
        let currentSize = Array.from(this.cache.values())
            .reduce((total, data) => total + data.length, 0);
        
        // 如果添加新数据会超出缓存限制，清理最少使用的数据
        while (currentSize + newDataSize > this.maxCacheSize && this.cache.size > 0) {
            const oldestKey = this.cache.keys().next().value;
            const oldestData = this.cache.get(oldestKey);
            this.cache.delete(oldestKey);
            currentSize -= oldestData.length;
        }
    }
    
    /**
     * 预测性数据预加载
     */
    async predictivePreload(currentRange) {
        const [begin, end] = currentRange;
        const chunkSize = end - begin;
        
        // 预加载下一个可能需要的数据块
        const nextBegin = end;
        const nextEnd = Math.min(nextBegin + chunkSize * 2, this.length);
        
        if (nextBegin < this.length) {
            // 异步预加载，不阻塞当前请求
            setTimeout(() => {
                this.requestRange(nextBegin, nextEnd).catch(() => {
                    // 预加载失败不影响主流程
                });
            }, 100);
        }
    }
}
```

### 错误重试机制

```javascript
class ResilientTransport extends pdfjsLib.PDFDataRangeTransport {
    constructor(url, length, initialData) {
        super(length, initialData, true);
        this.url = url;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.backoffMultiplier = 2;
    }
    
    /**
     * 带重试的范围请求
     */
    async requestRange(begin, end) {
        let lastError;
        let delay = this.retryDelay;
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const data = await this.fetchRange(begin, end);
                this.onDataRange(begin, data);
                return;
            } catch (error) {
                lastError = error;
                
                if (attempt < this.maxRetries) {
                    console.warn(`请求失败，${delay}ms 后重试 (${attempt + 1}/${this.maxRetries}):`, error.message);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= this.backoffMultiplier;
                } else {
                    console.error('请求最终失败:', error.message);
                }
            }
        }
        
        throw lastError;
    }
}
```

### 多源数据传输

```javascript
class MultiSourceTransport extends pdfjsLib.PDFDataRangeTransport {
    constructor(urls, length, initialData) {
        super(length, initialData, true);
        this.urls = urls; // 多个数据源URL
        this.currentUrlIndex = 0;
        this.failedUrls = new Set();
    }
    
    /**
     * 多源请求策略
     */
    async requestRange(begin, end) {
        let lastError;
        
        // 尝试所有可用的数据源
        for (let i = 0; i < this.urls.length; i++) {
            const urlIndex = (this.currentUrlIndex + i) % this.urls.length;
            const url = this.urls[urlIndex];
            
            if (this.failedUrls.has(url)) {
                continue; // 跳过已知失败的URL
            }
            
            try {
                const data = await this.fetchRangeFromUrl(url, begin, end);
                this.onDataRange(begin, data);
                this.currentUrlIndex = urlIndex; // 更新首选数据源
                return;
            } catch (error) {
                lastError = error;
                console.warn(`数据源 ${url} 请求失败:`, error.message);
                
                // 标记为失败的数据源
                this.failedUrls.add(url);
            }
        }
        
        throw new Error(`所有数据源都不可用: ${lastError?.message}`);
    }
    
    /**
     * 从指定URL获取数据范围
     */
    async fetchRangeFromUrl(url, begin, end) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.setRequestHeader('Range', `bytes=${begin}-${end - 1}`);
            xhr.responseType = 'arraybuffer';
            xhr.timeout = 10000;
            
            xhr.onload = () => {
                if (xhr.status === 206 || xhr.status === 200) {
                    resolve(new Uint8Array(xhr.response));
                } else {
                    reject(new Error(`HTTP ${xhr.status}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('网络错误'));
            xhr.ontimeout = () => reject(new Error('请求超时'));
            xhr.send();
        });
    }
}
```

## 性能优化

### 数据压缩

```javascript
class CompressedTransport extends pdfjsLib.PDFDataRangeTransport {
    constructor(url, length, initialData) {
        super(length, initialData, true);
        this.url = url;
        this.compressionEnabled = 'CompressionStream' in window;
    }
    
    /**
     * 请求压缩数据
     */
    async requestRange(begin, end) {
        const headers = {
            'Range': `bytes=${begin}-${end - 1}`
        };
        
        if (this.compressionEnabled) {
            headers['Accept-Encoding'] = 'gzip, deflate, br';
        }
        
        const response = await fetch(this.url, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let data = new Uint8Array(await response.arrayBuffer());
        
        // 如果数据被压缩，解压缩
        if (response.headers.get('Content-Encoding')) {
            data = await this.decompress(data, response.headers.get('Content-Encoding'));
        }
        
        this.onDataRange(begin, data);
    }
    
    /**
     * 解压缩数据
     */
    async decompress(data, encoding) {
        if (!this.compressionEnabled) return data;
        
        try {
            const stream = new DecompressionStream(encoding);
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(data);
            writer.close();
            
            const chunks = [];
            let result;
            
            while (!(result = await reader.read()).done) {
                chunks.push(result.value);
            }
            
            // 合并所有数据块
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const decompressed = new Uint8Array(totalLength);
            let offset = 0;
            
            for (const chunk of chunks) {
                decompressed.set(chunk, offset);
                offset += chunk.length;
            }
            
            return decompressed;
        } catch (error) {
            console.warn('解压缩失败，使用原始数据:', error);
            return data;
        }
    }
}
```

## 注意事项

1. **服务器支持**：确保服务器支持 HTTP Range 请求
2. **CORS 配置**：跨域请求需要正确的 CORS 头
3. **缓存策略**：合理设置缓存大小和清理策略
4. **错误处理**：实现适当的重试和降级机制
5. **性能监控**：监控请求次数和数据传输效率
6. **内存管理**：及时清理不需要的缓存数据

## 相关链接

- [PDFWorker](/api/pdf-worker)
- [GlobalWorkerOptions](/api/global-worker-options)
- [性能优化指南](/guide/performance)
- [错误处理](/guide/error-handling)
- [自定义查看器](/examples/custom-viewer)