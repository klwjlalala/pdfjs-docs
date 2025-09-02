# AnnotationEditorUIManager

`AnnotationEditorUIManager` 是 PDF.js 中负责管理注释编辑器用户界面的核心类。它协调各种编辑器组件，处理用户交互，并管理编辑状态。

## 概述

`AnnotationEditorUIManager` 提供了一个统一的接口来管理PDF注释的编辑功能，包括：
- 编辑器模式切换
- 工具栏管理
- 键盘快捷键处理
- 编辑器生命周期管理
- 撤销/重做功能

## 主要方法

### constructor(container, eventBus, altTextManager)

创建一个新的 `AnnotationEditorUIManager` 实例。

**参数：**
- `container` (HTMLElement): 编辑器容器元素
- `eventBus` (EventBus): 事件总线实例
- `altTextManager` (AltTextManager): 替代文本管理器

```javascript
const uiManager = new pdfjsLib.AnnotationEditorUIManager(
    document.getElementById('editorContainer'),
    eventBus,
    altTextManager
);
```

### setEditingState(isEditing)

设置编辑状态。

**参数：**
- `isEditing` (boolean): 是否处于编辑状态

```javascript
// 启用编辑模式
uiManager.setEditingState(true);

// 禁用编辑模式
uiManager.setEditingState(false);
```

### setMode(mode, editId, isFromKeyboard)

设置编辑器模式。

**参数：**
- `mode` (number): 编辑器模式（如自由文本、墨迹等）
- `editId` (string, 可选): 编辑器ID
- `isFromKeyboard` (boolean, 可选): 是否来自键盘操作

```javascript
// 切换到自由文本编辑模式
uiManager.setMode(pdfjsLib.AnnotationEditorType.FREETEXT);

// 切换到墨迹编辑模式
uiManager.setMode(pdfjsLib.AnnotationEditorType.INK);

// 退出编辑模式
uiManager.setMode(pdfjsLib.AnnotationEditorType.NONE);
```

### addLayer(layer)

添加编辑器层。

**参数：**
- `layer` (AnnotationEditorLayer): 编辑器层实例

```javascript
const editorLayer = new pdfjsLib.AnnotationEditorLayer({
    uiManager: uiManager,
    pageIndex: 0,
    div: pageContainer
});

uiManager.addLayer(editorLayer);
```

### removeLayer(layer)

移除编辑器层。

**参数：**
- `layer` (AnnotationEditorLayer): 要移除的编辑器层

```javascript
uiManager.removeLayer(editorLayer);
```

### updateToolbar(mode)

更新工具栏状态。

**参数：**
- `mode` (number): 当前编辑器模式

```javascript
uiManager.updateToolbar(pdfjsLib.AnnotationEditorType.FREETEXT);
```

### updateMode(mode)

更新编辑模式。

**参数：**
- `mode` (number): 新的编辑器模式

```javascript
uiManager.updateMode(pdfjsLib.AnnotationEditorType.INK);
```

### getActive()

获取当前活动的编辑器。

**返回值：**
- `AnnotationEditor | null`: 当前活动的编辑器实例

```javascript
const activeEditor = uiManager.getActive();
if (activeEditor) {
    console.log('当前活动编辑器:', activeEditor.constructor.name);
}
```

### getMode()

获取当前编辑模式。

**返回值：**
- `number`: 当前编辑器模式

```javascript
const currentMode = uiManager.getMode();
switch (currentMode) {
    case pdfjsLib.AnnotationEditorType.FREETEXT:
        console.log('自由文本模式');
        break;
    case pdfjsLib.AnnotationEditorType.INK:
        console.log('墨迹模式');
        break;
    default:
        console.log('无编辑模式');
}
```

## 完整示例

以下是一个完整的注释编辑器UI管理器实现：

```html
<!DOCTYPE html>
<html>
<head>
    <title>PDF 注释编辑器</title>
    <style>
        .editor-container {
            position: relative;
            width: 100%;
            height: 600px;
            border: 1px solid #ccc;
        }
        
        .editor-toolbar {
            padding: 10px;
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .editor-button {
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: white;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .editor-button:hover {
            background: #e6f3ff;
        }
        
        .editor-button.active {
            background: #007acc;
            color: white;
        }
        
        .editor-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .page-container {
            position: relative;
            margin: 20px auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .annotation-editor {
            position: absolute;
            border: 2px solid #007acc;
            background: rgba(0, 122, 204, 0.1);
        }
        
        .freetext-editor {
            min-width: 100px;
            min-height: 30px;
            padding: 5px;
        }
        
        .ink-editor {
            pointer-events: none;
        }
        
        .editor-controls {
            position: absolute;
            top: -30px;
            right: 0;
            display: flex;
            gap: 5px;
        }
        
        .control-button {
            width: 24px;
            height: 24px;
            border: none;
            background: #007acc;
            color: white;
            cursor: pointer;
            border-radius: 3px;
            font-size: 12px;
        }
        
        .status-bar {
            padding: 5px 10px;
            background: #f9f9f9;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="editor-container">
        <div class="editor-toolbar">
            <button id="selectBtn" class="editor-button active">选择</button>
            <button id="freetextBtn" class="editor-button">文本</button>
            <button id="inkBtn" class="editor-button">墨迹</button>
            <div style="margin-left: auto; display: flex; gap: 10px;">
                <button id="undoBtn" class="editor-button" disabled>撤销</button>
                <button id="redoBtn" class="editor-button" disabled>重做</button>
                <button id="deleteBtn" class="editor-button" disabled>删除</button>
            </div>
        </div>
        
        <div id="pdfContainer" class="pdf-container"></div>
        
        <div class="status-bar">
            <span id="statusText">就绪</span>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        /**
         * PDF 注释编辑器管理器
         */
        class PDFAnnotationEditor {
            constructor() {
                this.pdfDoc = null;
                this.currentPage = 1;
                this.scale = 1.0;
                this.uiManager = null;
                this.eventBus = new pdfjsLib.EventBus();
                this.editorLayers = new Map();
                
                this.initializeUI();
                this.bindEvents();
            }
            
            /**
             * 初始化用户界面
             */
            initializeUI() {
                this.container = document.getElementById('pdfContainer');
                this.statusText = document.getElementById('statusText');
                
                // 初始化按钮
                this.selectBtn = document.getElementById('selectBtn');
                this.freetextBtn = document.getElementById('freetextBtn');
                this.inkBtn = document.getElementById('inkBtn');
                this.undoBtn = document.getElementById('undoBtn');
                this.redoBtn = document.getElementById('redoBtn');
                this.deleteBtn = document.getElementById('deleteBtn');
                
                // 创建UI管理器
                this.uiManager = new pdfjsLib.AnnotationEditorUIManager(
                    this.container,
                    this.eventBus
                );
                
                this.updateStatus('请加载PDF文件');
            }
            
            /**
             * 绑定事件监听器
             */
            bindEvents() {
                // 工具栏按钮事件
                this.selectBtn.addEventListener('click', () => {
                    this.setMode(pdfjsLib.AnnotationEditorType.NONE);
                });
                
                this.freetextBtn.addEventListener('click', () => {
                    this.setMode(pdfjsLib.AnnotationEditorType.FREETEXT);
                });
                
                this.inkBtn.addEventListener('click', () => {
                    this.setMode(pdfjsLib.AnnotationEditorType.INK);
                });
                
                this.undoBtn.addEventListener('click', () => {
                    this.undo();
                });
                
                this.redoBtn.addEventListener('click', () => {
                    this.redo();
                });
                
                this.deleteBtn.addEventListener('click', () => {
                    this.deleteSelected();
                });
                
                // 事件总线监听
                this.eventBus.on('annotationeditorstateschanged', (evt) => {
                    this.onEditorStatesChanged(evt);
                });
                
                this.eventBus.on('annotationeditorparamschanged', (evt) => {
                    this.onEditorParamsChanged(evt);
                });
                
                // 键盘快捷键
                document.addEventListener('keydown', (e) => {
                    this.handleKeydown(e);
                });
                
                // 文件拖拽
                this.container.addEventListener('dragover', (e) => {
                    e.preventDefault();
                });
                
                this.container.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files.length > 0 && files[0].type === 'application/pdf') {
                        this.loadPDF(files[0]);
                    }
                });
            }
            
            /**
             * 加载PDF文件
             */
            async loadPDF(file) {
                try {
                    this.updateStatus('正在加载PDF...');
                    
                    const arrayBuffer = await file.arrayBuffer();
                    this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
                    
                    await this.renderPage(1);
                    this.updateStatus(`PDF已加载 (${this.pdfDoc.numPages} 页)`);
                    
                } catch (error) {
                    this.updateStatus('加载PDF失败: ' + error.message);
                    console.error('PDF加载错误:', error);
                }
            }
            
            /**
             * 渲染页面
             */
            async renderPage(pageNum) {
                try {
                    const page = await this.pdfDoc.getPage(pageNum);
                    const viewport = page.getViewport({ scale: this.scale });
                    
                    // 创建页面容器
                    const pageContainer = document.createElement('div');
                    pageContainer.className = 'page-container';
                    pageContainer.style.width = viewport.width + 'px';
                    pageContainer.style.height = viewport.height + 'px';
                    
                    // 创建画布
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    // 渲染页面
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    pageContainer.appendChild(canvas);
                    
                    // 创建编辑器层
                    const editorLayerDiv = document.createElement('div');
                    editorLayerDiv.className = 'annotation-editor-layer';
                    editorLayerDiv.style.position = 'absolute';
                    editorLayerDiv.style.top = '0';
                    editorLayerDiv.style.left = '0';
                    editorLayerDiv.style.width = '100%';
                    editorLayerDiv.style.height = '100%';
                    
                    pageContainer.appendChild(editorLayerDiv);
                    
                    // 创建编辑器层实例
                    const editorLayer = new pdfjsLib.AnnotationEditorLayer({
                        uiManager: this.uiManager,
                        pageIndex: pageNum - 1,
                        div: editorLayerDiv,
                        accessibilityManager: null,
                        annotationLayer: null,
                        drawLayer: null,
                        textLayer: null,
                        viewport: viewport
                    });
                    
                    this.editorLayers.set(pageNum, editorLayer);
                    this.uiManager.addLayer(editorLayer);
                    
                    // 清空容器并添加新页面
                    this.container.innerHTML = '';
                    this.container.appendChild(pageContainer);
                    
                    this.currentPage = pageNum;
                    
                } catch (error) {
                    this.updateStatus('渲染页面失败: ' + error.message);
                    console.error('页面渲染错误:', error);
                }
            }
            
            /**
             * 设置编辑模式
             */
            setMode(mode) {
                this.uiManager.setMode(mode);
                this.updateToolbarState(mode);
                
                const modeNames = {
                    [pdfjsLib.AnnotationEditorType.NONE]: '选择模式',
                    [pdfjsLib.AnnotationEditorType.FREETEXT]: '文本编辑模式',
                    [pdfjsLib.AnnotationEditorType.INK]: '墨迹编辑模式'
                };
                
                this.updateStatus(modeNames[mode] || '未知模式');
            }
            
            /**
             * 更新工具栏状态
             */
            updateToolbarState(mode) {
                // 重置所有按钮状态
                [this.selectBtn, this.freetextBtn, this.inkBtn].forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 激活当前模式按钮
                switch (mode) {
                    case pdfjsLib.AnnotationEditorType.NONE:
                        this.selectBtn.classList.add('active');
                        break;
                    case pdfjsLib.AnnotationEditorType.FREETEXT:
                        this.freetextBtn.classList.add('active');
                        break;
                    case pdfjsLib.AnnotationEditorType.INK:
                        this.inkBtn.classList.add('active');
                        break;
                }
            }
            
            /**
             * 撤销操作
             */
            undo() {
                // 实现撤销逻辑
                this.updateStatus('撤销操作');
            }
            
            /**
             * 重做操作
             */
            redo() {
                // 实现重做逻辑
                this.updateStatus('重做操作');
            }
            
            /**
             * 删除选中的编辑器
             */
            deleteSelected() {
                const activeEditor = this.uiManager.getActive();
                if (activeEditor) {
                    activeEditor.remove();
                    this.updateStatus('已删除选中的注释');
                }
            }
            
            /**
             * 编辑器状态变化处理
             */
            onEditorStatesChanged(evt) {
                const hasActiveEditor = evt.details.hasSelectedEditor;
                this.deleteBtn.disabled = !hasActiveEditor;
                
                if (hasActiveEditor) {
                    this.updateStatus('已选中注释编辑器');
                }
            }
            
            /**
             * 编辑器参数变化处理
             */
            onEditorParamsChanged(evt) {
                console.log('编辑器参数变化:', evt.details);
            }
            
            /**
             * 处理键盘事件
             */
            handleKeydown(event) {
                if (event.ctrlKey) {
                    switch (event.key) {
                        case 'z':
                            event.preventDefault();
                            this.undo();
                            break;
                        case 'y':
                            event.preventDefault();
                            this.redo();
                            break;
                    }
                }
                
                switch (event.key) {
                    case 'Delete':
                        this.deleteSelected();
                        break;
                    case 'Escape':
                        this.setMode(pdfjsLib.AnnotationEditorType.NONE);
                        break;
                }
            }
            
            /**
             * 更新状态文本
             */
            updateStatus(message) {
                this.statusText.textContent = message;
            }
        }
        
        // 初始化编辑器
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const editor = new PDFAnnotationEditor();
        
        // 添加文件选择功能
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                editor.loadPDF(e.target.files[0]);
            }
        });
        
        // 添加加载按钮
        const loadBtn = document.createElement('button');
        loadBtn.textContent = '加载PDF';
        loadBtn.className = 'editor-button';
        loadBtn.style.position = 'absolute';
        loadBtn.style.top = '10px';
        loadBtn.style.right = '10px';
        loadBtn.addEventListener('click', () => fileInput.click());
        document.querySelector('.editor-toolbar').appendChild(loadBtn);
    </script>
</body>
</html>
```

## 事件处理

### annotationeditorstateschanged

当编辑器状态发生变化时触发。

```javascript
eventBus.on('annotationeditorstateschanged', (evt) => {
    const { hasSelectedEditor, isEmpty } = evt.details;
    
    // 更新UI状态
    deleteButton.disabled = !hasSelectedEditor;
    toolbar.classList.toggle('has-selection', hasSelectedEditor);
});
```

### annotationeditorparamschanged

当编辑器参数发生变化时触发。

```javascript
eventBus.on('annotationeditorparamschanged', (evt) => {
    const { type, value } = evt.details;
    
    switch (type) {
        case pdfjsLib.AnnotationEditorParamsType.FREETEXT_SIZE:
            fontSizeInput.value = value;
            break;
        case pdfjsLib.AnnotationEditorParamsType.FREETEXT_COLOR:
            colorPicker.value = value;
            break;
    }
});
```

## 高级功能

### 自定义工具栏

```javascript
class CustomToolbar {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.toolbar = this.createToolbar();
    }
    
    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'custom-toolbar';
        
        // 添加模式切换按钮
        const modes = [
            { type: pdfjsLib.AnnotationEditorType.NONE, label: '选择' },
            { type: pdfjsLib.AnnotationEditorType.FREETEXT, label: '文本' },
            { type: pdfjsLib.AnnotationEditorType.INK, label: '墨迹' }
        ];
        
        modes.forEach(mode => {
            const button = document.createElement('button');
            button.textContent = mode.label;
            button.addEventListener('click', () => {
                this.uiManager.setMode(mode.type);
            });
            toolbar.appendChild(button);
        });
        
        return toolbar;
    }
}
```

### 编辑器配置

```javascript
// 配置编辑器参数
const editorConfig = {
    freetext: {
        defaultSize: 16,
        defaultColor: '#000000',
        defaultFontFamily: 'Arial'
    },
    ink: {
        defaultColor: '#FF0000',
        defaultThickness: 2
    }
};

// 应用配置
function applyEditorConfig(uiManager, config) {
    Object.keys(config).forEach(editorType => {
        const params = config[editorType];
        Object.keys(params).forEach(param => {
            uiManager.setEditorParam(editorType, param, params[param]);
        });
    });
}
```

## 注意事项

1. **生命周期管理**：确保正确管理编辑器层的创建和销毁
2. **事件处理**：妥善处理各种编辑器事件，避免内存泄漏
3. **性能优化**：对于大型文档，考虑延迟加载编辑器层
4. **用户体验**：提供清晰的视觉反馈和状态指示
5. **键盘支持**：实现完整的键盘快捷键支持
6. **移动端适配**：考虑触摸设备的特殊需求

## 相关链接

- [AnnotationEditorLayer](/api/annotation-editor-layer)
- [ColorPicker](/api/color-picker)
- [注释示例](/examples/annotations)
- [交互式表单](/examples/interactive-forms)
- [PDF.js 事件系统](/guide/events)