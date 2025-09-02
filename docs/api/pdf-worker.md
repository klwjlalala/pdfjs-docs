# PDFWorker

`PDFWorker` 是 PDF.js 中用于管理 Web Worker 的核心类。它负责在后台线程中处理 PDF 解析和渲染任务，避免阻塞主线程，提供更好的用户体验。

## 概述

`PDFWorker` 主要功能包括：
- 创建和管理 Web Worker 实例
- 处理 PDF 文档的解析任务
- 管理 Worker 的生命周期
- 提供 Worker 状态监控
- 支持 Worker 池管理

## 主要方法

### constructor(options)

创建一个新的 `PDFWorker` 实例。

**参数：**
- `options` (Object): 配置选项
  - `name` (string): Worker 名称
  - `port` (MessagePort): 消息端口
  - `verbosity` (number): 日志级别

```javascript
const worker = new pdfjsLib.PDFWorker({
    name: 'pdf-worker-1',
    verbosity: pdfjsLib.VerbosityLevel.INFOS
});
```

### fromPort(params)

从消息端口创建 Worker 实例。

**参数：**
- `params` (Object): 参数对象
  - `name` (string): Worker 名称
  - `port` (MessagePort): 消息端口

```javascript
const worker = pdfjsLib.PDFWorker.fromPort({
    name: 'shared-worker',
    port: messagePort
});
```

### destroy()

销毁 Worker 实例并清理资源。

**返回值：**
- `Promise<void>`: 销毁完成的 Promise

```javascript
await worker.destroy();
console.log('Worker 已销毁');
```

### postMessage(data, transfers)

向 Worker 发送消息。

**参数：**
- `data` (any): 要发送的数据
- `transfers` (Array): 可转移对象数组

```javascript
worker.postMessage({
    type: 'parse',
    data: pdfData
}, [pdfData.buffer]);
```

### terminate()

终止 Worker 执行。

```javascript
worker.terminate();
```

## 静态方法

### getWorkerSrc()

获取 Worker 脚本的 URL。

**返回值：**
- `string`: Worker 脚本 URL

```javascript
const workerSrc = pdfjsLib.PDFWorker.getWorkerSrc();
console.log('Worker 脚本路径:', workerSrc);
```

### cleanup()

清理所有 Worker 实例。

```javascript
pdfjsLib.PDFWorker.cleanup();
```

## 属性

### name

Worker 的名称。

```javascript
console.log('Worker 名称:', worker.name);
```

### port

消息端口对象。

```javascript
if (worker.port) {
    console.log('Worker 使用消息端口通信');
}
```

### destroyed

Worker 是否已被销毁。

```javascript
if (worker.destroyed) {
    console.log('Worker 已销毁');
}
```

## 完整示例

以下是一个完整的 Worker 管理示例：

```html
<!DOCTYPE html>
<html>
<head>
    <title>PDF.js Worker 管理</title>
    <style>
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .worker-panel {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .worker-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
        }
        
        .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 16px;
            color: #333;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        
        .btn {
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        
        .btn:hover {
            background: #f0f0f0;
        }
        
        .btn.primary {
            background: #007acc;
            color: white;
            border-color: #007acc;
        }
        
        .btn.primary:hover {
            background: #005a9e;
        }
        
        .btn.danger {
            background: #dc3545;
            color: white;
            border-color: #dc3545;
        }
        
        .btn.danger:hover {
            background: #c82333;
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
            max-height: 300px;
            overflow-y: auto;
            white-space: pre-wrap;
        }
        
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .status.active {
            background: #d4edda;
            color: #155724;
        }
        
        .status.destroyed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status.idle {
            background: #fff3cd;
            color: #856404;
        }
        
        .file-input {
            margin-bottom: 15px;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: #007acc;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PDF.js Worker 管理示例</h1>
        
        <div class="worker-panel">
            <h2>Worker 状态</h2>
            <div class="worker-info">
                <div class="info-item">
                    <div class="info-label">Worker 数量</div>
                    <div id="workerCount" class="info-value">0</div>
                </div>
                <div class="info-item">
                    <div class="info-label">活跃任务</div>
                    <div id="activeTasks" class="info-value">0</div>
                </div>
                <div class="info-item">
                    <div class="info-label">总处理量</div>
                    <div id="totalProcessed" class="info-value">0</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Worker 源</div>
                    <div id="workerSrc" class="info-value">-</div>
                </div>
            </div>
            
            <div class="controls">
                <button id="createWorker" class="btn primary">创建 Worker</button>
                <button id="destroyWorker" class="btn danger">销毁 Worker</button>
                <button id="cleanupWorkers" class="btn">清理所有</button>
                <button id="testWorker" class="btn">测试 Worker</button>
                <button id="clearLog" class="btn">清除日志</button>
            </div>
            
            <div class="file-input">
                <input type="file" id="pdfFile" accept=".pdf" />
                <button id="processPDF" class="btn primary">处理 PDF</button>
            </div>
            
            <div class="progress-bar" id="progressContainer" style="display: none;">
                <div class="progress-fill" id="progressFill"></div>
            </div>
        </div>
        
        <div class="worker-panel">
            <h2>Worker 列表</h2>
            <div id="workerList"></div>
        </div>
        
        <div class="worker-panel">
            <h2>日志</h2>
            <div id="logPanel" class="log-panel"></div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        /**
         * Worker 管理器类
         */
        class WorkerManager {
            constructor() {
                this.workers = new Map();
                this.workerCounter = 0;
                this.activeTasks = 0;
                this.totalProcessed = 0;
                
                this.initializeElements();
                this.bindEvents();
                this.updateUI();
                this.log('Worker 管理器初始化完成');
            }
            
            /**
             * 初始化DOM元素
             */
            initializeElements() {
                this.workerCountEl = document.getElementById('workerCount');
                this.activeTasksEl = document.getElementById('activeTasks');
                this.totalProcessedEl = document.getElementById('totalProcessed');
                this.workerSrcEl = document.getElementById('workerSrc');
                this.workerListEl = document.getElementById('workerList');
                this.logPanelEl = document.getElementById('logPanel');
                this.progressContainer = document.getElementById('progressContainer');
                this.progressFill = document.getElementById('progressFill');
                
                // 显示 Worker 源路径
                try {
                    const workerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc || 'default';
                    this.workerSrcEl.textContent = workerSrc;
                } catch (e) {
                    this.workerSrcEl.textContent = '未设置';
                }
            }
            
            /**
             * 绑定事件监听器
             */
            bindEvents() {
                document.getElementById('createWorker').addEventListener('click', () => {
                    this.createWorker();
                });
                
                document.getElementById('destroyWorker').addEventListener('click', () => {
                    this.destroyLastWorker();
                });
                
                document.getElementById('cleanupWorkers').addEventListener('click', () => {
                    this.cleanupAllWorkers();
                });
                
                document.getElementById('testWorker').addEventListener('click', () => {
                    this.testWorker();
                });
                
                document.getElementById('clearLog').addEventListener('click', () => {
                    this.clearLog();
                });
                
                document.getElementById('processPDF').addEventListener('click', () => {
                    this.processPDFFile();
                });
            }
            
            /**
             * 创建新的 Worker
             */
            createWorker() {
                try {
                    const workerId = `worker-${++this.workerCounter}`;
                    const worker = new pdfjsLib.PDFWorker({
                        name: workerId,
                        verbosity: pdfjsLib.VerbosityLevel.INFOS
                    });
                    
                    this.workers.set(workerId, {
                        instance: worker,
                        created: new Date(),
                        status: 'active',
                        tasksProcessed: 0
                    });
                    
                    this.log(`创建 Worker: ${workerId}`);
                    this.updateUI();
                } catch (error) {
                    this.log(`创建 Worker 失败: ${error.message}`, 'error');
                }
            }
            
            /**
             * 销毁最后一个 Worker
             */
            async destroyLastWorker() {
                if (this.workers.size === 0) {
                    this.log('没有可销毁的 Worker', 'warning');
                    return;
                }
                
                const lastWorkerId = Array.from(this.workers.keys()).pop();
                const workerData = this.workers.get(lastWorkerId);
                
                try {
                    await workerData.instance.destroy();
                    this.workers.delete(lastWorkerId);
                    this.log(`销毁 Worker: ${lastWorkerId}`);
                    this.updateUI();
                } catch (error) {
                    this.log(`销毁 Worker 失败: ${error.message}`, 'error');
                }
            }
            
            /**
             * 清理所有 Worker
             */
            async cleanupAllWorkers() {
                if (this.workers.size === 0) {
                    this.log('没有需要清理的 Worker', 'warning');
                    return;
                }
                
                try {
                    // 销毁所有 Worker
                    const destroyPromises = Array.from(this.workers.values()).map(workerData => 
                        workerData.instance.destroy()
                    );
                    
                    await Promise.all(destroyPromises);
                    
                    // 清理 Worker 映射
                    this.workers.clear();
                    
                    // 调用全局清理
                    pdfjsLib.PDFWorker.cleanup();
                    
                    this.log('所有 Worker 已清理');
                    this.updateUI();
                } catch (error) {
                    this.log(`清理 Worker 失败: ${error.message}`, 'error');
                }
            }
            
            /**
             * 测试 Worker 功能
             */
            async testWorker() {
                if (this.workers.size === 0) {
                    this.log('请先创建 Worker', 'warning');
                    return;
                }
                
                const workerId = Array.from(this.workers.keys())[0];
                const workerData = this.workers.get(workerId);
                
                try {
                    this.log(`测试 Worker: ${workerId}`);
                    this.activeTasks++;
                    this.updateUI();
                    
                    // 模拟异步任务
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    workerData.tasksProcessed++;
                    this.totalProcessed++;
                    this.activeTasks--;
                    
                    this.log(`Worker ${workerId} 测试完成`);
                    this.updateUI();
                } catch (error) {
                    this.activeTasks--;
                    this.log(`Worker 测试失败: ${error.message}`, 'error');
                    this.updateUI();
                }
            }
            
            /**
             * 处理 PDF 文件
             */
            async processPDFFile() {
                const fileInput = document.getElementById('pdfFile');
                const file = fileInput.files[0];
                
                if (!file) {
                    this.log('请选择 PDF 文件', 'warning');
                    return;
                }
                
                if (this.workers.size === 0) {
                    this.log('请先创建 Worker', 'warning');
                    return;
                }
                
                try {
                    this.log(`开始处理 PDF: ${file.name}`);
                    this.showProgress(0);
                    this.activeTasks++;
                    this.updateUI();
                    
                    // 读取文件
                    const arrayBuffer = await file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    
                    this.showProgress(25);
                    
                    // 使用第一个可用的 Worker
                    const workerId = Array.from(this.workers.keys())[0];
                    const workerData = this.workers.get(workerId);
                    
                    // 加载 PDF 文档
                    const loadingTask = pdfjsLib.getDocument({
                        data: uint8Array,
                        worker: workerData.instance
                    });
                    
                    this.showProgress(50);
                    
                    const pdf = await loadingTask.promise;
                    
                    this.showProgress(75);
                    
                    // 获取第一页进行测试
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 1.0 });
                    
                    this.showProgress(100);
                    
                    workerData.tasksProcessed++;
                    this.totalProcessed++;
                    this.activeTasks--;
                    
                    this.log(`PDF 处理完成: ${pdf.numPages} 页, 尺寸: ${viewport.width}x${viewport.height}`);
                    
                    // 清理资源
                    await pdf.destroy();
                    
                    setTimeout(() => this.hideProgress(), 1000);
                    this.updateUI();
                    
                } catch (error) {
                    this.activeTasks--;
                    this.hideProgress();
                    this.log(`PDF 处理失败: ${error.message}`, 'error');
                    this.updateUI();
                }
            }
            
            /**
             * 显示进度条
             */
            showProgress(percent) {
                this.progressContainer.style.display = 'block';
                this.progressFill.style.width = `${percent}%`;
            }
            
            /**
             * 隐藏进度条
             */
            hideProgress() {
                this.progressContainer.style.display = 'none';
                this.progressFill.style.width = '0%';
            }
            
            /**
             * 更新UI显示
             */
            updateUI() {
                // 更新统计信息
                this.workerCountEl.textContent = this.workers.size;
                this.activeTasksEl.textContent = this.activeTasks;
                this.totalProcessedEl.textContent = this.totalProcessed;
                
                // 更新 Worker 列表
                this.updateWorkerList();
            }
            
            /**
             * 更新 Worker 列表显示
             */
            updateWorkerList() {
                this.workerListEl.innerHTML = '';
                
                if (this.workers.size === 0) {
                    this.workerListEl.innerHTML = '<p>暂无 Worker</p>';
                    return;
                }
                
                this.workers.forEach((workerData, workerId) => {
                    const workerEl = document.createElement('div');
                    workerEl.className = 'info-item';
                    
                    const status = workerData.instance.destroyed ? 'destroyed' : 'active';
                    const statusClass = status === 'active' ? 'active' : 'destroyed';
                    
                    workerEl.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${workerId}</strong>
                                <span class="status ${statusClass}">${status === 'active' ? '活跃' : '已销毁'}</span>
                            </div>
                            <div style="text-align: right; font-size: 12px; color: #666;">
                                <div>创建时间: ${workerData.created.toLocaleTimeString()}</div>
                                <div>处理任务: ${workerData.tasksProcessed}</div>
                            </div>
                        </div>
                    `;
                    
                    this.workerListEl.appendChild(workerEl);
                });
            }
            
            /**
             * 记录日志
             */
            log(message, type = 'info') {
                const timestamp = new Date().toLocaleTimeString();
                const prefix = type === 'error' ? '[ERROR]' : 
                              type === 'warning' ? '[WARN]' : '[INFO]';
                
                const logEntry = `${timestamp} ${prefix} ${message}\n`;
                this.logPanelEl.textContent += logEntry;
                this.logPanelEl.scrollTop = this.logPanelEl.scrollHeight;
                
                console.log(`WorkerManager ${prefix}`, message);
            }
            
            /**
             * 清除日志
             */
            clearLog() {
                this.logPanelEl.textContent = '';
            }
        }
        
        // 设置 PDF.js Worker 源
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // 初始化 Worker 管理器
        const workerManager = new WorkerManager();
        
        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            workerManager.cleanupAllWorkers();
        });
    </script>
</body>
</html>
```

## Worker 池管理

### 创建 Worker 池

```javascript
class PDFWorkerPool {
    constructor(maxWorkers = 4) {
        this.maxWorkers = maxWorkers;
        this.workers = [];
        this.availableWorkers = [];
        this.busyWorkers = new Set();
        this.taskQueue = [];
    }
    
    /**
     * 初始化 Worker 池
     */
    async initialize() {
        for (let i = 0; i < this.maxWorkers; i++) {
            const worker = new pdfjsLib.PDFWorker({
                name: `pool-worker-${i + 1}`
            });
            
            this.workers.push(worker);
            this.availableWorkers.push(worker);
        }
        
        console.log(`Worker 池初始化完成，包含 ${this.maxWorkers} 个 Worker`);
    }
    
    /**
     * 获取可用的 Worker
     */
    async getWorker() {
        if (this.availableWorkers.length > 0) {
            const worker = this.availableWorkers.pop();
            this.busyWorkers.add(worker);
            return worker;
        }
        
        // 等待 Worker 可用
        return new Promise((resolve) => {
            this.taskQueue.push(resolve);
        });
    }
    
    /**
     * 释放 Worker
     */
    releaseWorker(worker) {
        this.busyWorkers.delete(worker);
        
        if (this.taskQueue.length > 0) {
            const resolve = this.taskQueue.shift();
            this.busyWorkers.add(worker);
            resolve(worker);
        } else {
            this.availableWorkers.push(worker);
        }
    }
    
    /**
     * 销毁 Worker 池
     */
    async destroy() {
        const destroyPromises = this.workers.map(worker => worker.destroy());
        await Promise.all(destroyPromises);
        
        this.workers = [];
        this.availableWorkers = [];
        this.busyWorkers.clear();
        this.taskQueue = [];
        
        console.log('Worker 池已销毁');
    }
}
```

### 使用 Worker 池

```javascript
// 创建 Worker 池
const workerPool = new PDFWorkerPool(4);
await workerPool.initialize();

// 处理多个 PDF 文件
async function processPDFFiles(files) {
    const results = [];
    
    for (const file of files) {
        const worker = await workerPool.getWorker();
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(arrayBuffer),
                worker: worker
            });
            
            const pdf = await loadingTask.promise;
            results.push({
                name: file.name,
                pages: pdf.numPages,
                success: true
            });
            
            await pdf.destroy();
        } catch (error) {
            results.push({
                name: file.name,
                error: error.message,
                success: false
            });
        } finally {
            workerPool.releaseWorker(worker);
        }
    }
    
    return results;
}
```

## 性能监控

### Worker 性能统计

```javascript
class WorkerPerformanceMonitor {
    constructor() {
        this.stats = new Map();
        this.startTime = Date.now();
    }
    
    /**
     * 记录任务开始
     */
    taskStart(workerId, taskType) {
        if (!this.stats.has(workerId)) {
            this.stats.set(workerId, {
                tasks: 0,
                totalTime: 0,
                errors: 0,
                currentTask: null
            });
        }
        
        const workerStats = this.stats.get(workerId);
        workerStats.currentTask = {
            type: taskType,
            startTime: Date.now()
        };
    }
    
    /**
     * 记录任务完成
     */
    taskComplete(workerId, success = true) {
        const workerStats = this.stats.get(workerId);
        if (!workerStats || !workerStats.currentTask) return;
        
        const duration = Date.now() - workerStats.currentTask.startTime;
        workerStats.tasks++;
        workerStats.totalTime += duration;
        
        if (!success) {
            workerStats.errors++;
        }
        
        workerStats.currentTask = null;
    }
    
    /**
     * 获取性能报告
     */
    getReport() {
        const report = {
            totalWorkers: this.stats.size,
            uptime: Date.now() - this.startTime,
            workers: []
        };
        
        this.stats.forEach((stats, workerId) => {
            report.workers.push({
                id: workerId,
                tasks: stats.tasks,
                averageTime: stats.tasks > 0 ? stats.totalTime / stats.tasks : 0,
                errors: stats.errors,
                errorRate: stats.tasks > 0 ? (stats.errors / stats.tasks) * 100 : 0
            });
        });
        
        return report;
    }
}
```

## 错误处理

### Worker 错误恢复

```javascript
class RobustWorkerManager {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.workers = new Map();
    }
    
    /**
     * 创建带错误恢复的 Worker
     */
    async createWorker(workerId) {
        let retries = 0;
        
        while (retries < this.maxRetries) {
            try {
                const worker = new pdfjsLib.PDFWorker({
                    name: workerId
                });
                
                // 监听 Worker 错误
                worker.port?.addEventListener('error', (event) => {
                    console.error(`Worker ${workerId} 错误:`, event);
                    this.handleWorkerError(workerId, event);
                });
                
                this.workers.set(workerId, worker);
                return worker;
                
            } catch (error) {
                retries++;
                console.warn(`创建 Worker ${workerId} 失败 (尝试 ${retries}/${this.maxRetries}):`, error);
                
                if (retries < this.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                } else {
                    throw new Error(`无法创建 Worker ${workerId}: ${error.message}`);
                }
            }
        }
    }
    
    /**
     * 处理 Worker 错误
     */
    async handleWorkerError(workerId, error) {
        console.log(`处理 Worker ${workerId} 错误，准备重启...`);
        
        try {
            // 销毁有问题的 Worker
            const oldWorker = this.workers.get(workerId);
            if (oldWorker) {
                await oldWorker.destroy();
            }
            
            // 创建新的 Worker
            await this.createWorker(workerId);
            console.log(`Worker ${workerId} 重启成功`);
            
        } catch (restartError) {
            console.error(`Worker ${workerId} 重启失败:`, restartError);
        }
    }
}
```

## 注意事项

1. **资源管理**：及时销毁不需要的 Worker 以释放内存
2. **错误处理**：实现适当的错误恢复机制
3. **性能监控**：监控 Worker 的性能和资源使用情况
4. **浏览器兼容性**：确保目标浏览器支持 Web Workers
5. **Worker 数量**：根据设备性能合理设置 Worker 数量
6. **消息传递**：注意可转移对象的使用以提高性能

## 相关链接

- [GlobalWorkerOptions](/api/global-worker-options)
- [PDFDataRangeTransport](/api/pdf-data-range-transport)
- [性能优化指南](/guide/performance)
- [错误处理](/guide/error-handling)
- [自定义查看器](/examples/custom-viewer)