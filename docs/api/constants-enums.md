# 常量和枚举

PDF.js 提供了一系列常量和枚举值，用于定义 PDF 处理过程中的各种状态、类型和配置选项。这些常量确保了代码的可读性和一致性。

## 概述

PDF.js 中的常量和枚举主要包括：
- 渲染意图和模式
- 注释类型和状态
- 文本层和编辑器类型
- 错误类型和状态码
- 颜色空间和混合模式
- 字体类型和编码

## 渲染相关常量

### RenderingIntentFlag

定义 PDF 渲染的意图标志。

```javascript
const RenderingIntentFlag = {
    DISPLAY: 0x01,           // 显示渲染
    PRINT: 0x02,             // 打印渲染
    ANNOTATIONS: 0x04,       // 包含注释
    OPLIST: 0x08,           // 操作列表
    FORMS: 0x10             // 包含表单
};

// 使用示例
const renderTask = page.render({
    canvasContext: ctx,
    viewport: viewport,
    intent: pdfjsLib.RenderingIntentFlag.DISPLAY | pdfjsLib.RenderingIntentFlag.ANNOTATIONS
});
```

### VerbosityLevel

定义日志详细程度级别。

```javascript
const VerbosityLevel = {
    ERRORS: 0,      // 仅错误
    WARNINGS: 1,    // 警告和错误
    INFOS: 5        // 所有信息
};

// 使用示例
pdfjsLib.GlobalWorkerOptions.verbosity = pdfjsLib.VerbosityLevel.WARNINGS;
```

## 注释相关枚举

### AnnotationType

定义注释的类型。

```javascript
const AnnotationType = {
    TEXT: 1,                // 文本注释
    LINK: 2,                // 链接注释
    FREETEXT: 3,            // 自由文本注释
    LINE: 4,                // 线条注释
    SQUARE: 5,              // 矩形注释
    CIRCLE: 6,              // 圆形注释
    POLYGON: 7,             // 多边形注释
    POLYLINE: 8,            // 折线注释
    HIGHLIGHT: 9,           // 高亮注释
    UNDERLINE: 10,          // 下划线注释
    SQUIGGLY: 11,           // 波浪线注释
    STRIKEOUT: 12,          // 删除线注释
    STAMP: 13,              // 印章注释
    CARET: 14,              // 插入符注释
    INK: 15,                // 墨迹注释
    POPUP: 16,              // 弹出注释
    FILEATTACHMENT: 17,     // 文件附件注释
    SOUND: 18,              // 声音注释
    MOVIE: 19,              // 电影注释
    WIDGET: 20,             // 小部件注释
    SCREEN: 21,             // 屏幕注释
    PRINTERMARK: 22,        // 打印标记注释
    TRAPNET: 23,            // 陷阱网络注释
    WATERMARK: 24,          // 水印注释
    THREED: 25,             // 3D注释
    REDACT: 26              // 编辑注释
};

// 使用示例
if (annotation.annotationType === pdfjsLib.AnnotationType.LINK) {
    console.log('这是一个链接注释');
}
```

### AnnotationFlag

定义注释的标志位。

```javascript
const AnnotationFlag = {
    INVISIBLE: 0x01,        // 不可见
    HIDDEN: 0x02,           // 隐藏
    PRINT: 0x04,            // 可打印
    NOZOOM: 0x08,           // 不缩放
    NOROTATE: 0x10,         // 不旋转
    NOVIEW: 0x20,           // 不显示
    READONLY: 0x40,         // 只读
    LOCKED: 0x80,           // 锁定
    TOGGLENOVIEW: 0x100,    // 切换不显示
    LOCKEDCONTENTS: 0x200   // 锁定内容
};

// 使用示例
const isPrintable = (annotation.flags & pdfjsLib.AnnotationFlag.PRINT) !== 0;
```

## 编辑器相关枚举

### AnnotationEditorType

定义注释编辑器的类型。

```javascript
const AnnotationEditorType = {
    DISABLE: -1,            // 禁用
    NONE: 0,                // 无
    FREETEXT: 3,            // 自由文本编辑器
    HIGHLIGHT: 9,           // 高亮编辑器
    STAMP: 13,              // 印章编辑器
    INK: 15                 // 墨迹编辑器
};

// 使用示例
const editorManager = new pdfjsLib.AnnotationEditorUIManager(container, eventBus);
editorManager.setMode(pdfjsLib.AnnotationEditorType.FREETEXT);
```

### AnnotationEditorParamsType

定义注释编辑器参数类型。

```javascript
const AnnotationEditorParamsType = {
    RESIZE: 1,              // 调整大小
    CREATE: 2,              // 创建
    FREETEXT_SIZE: 11,      // 自由文本大小
    FREETEXT_COLOR: 12,     // 自由文本颜色
    FREETEXT_OPACITY: 13,   // 自由文本透明度
    INK_COLOR: 21,          // 墨迹颜色
    INK_THICKNESS: 22,      // 墨迹粗细
    INK_OPACITY: 23,        // 墨迹透明度
    HIGHLIGHT_COLOR: 31,    // 高亮颜色
    HIGHLIGHT_DEFAULT_COLOR: 32  // 高亮默认颜色
};
```

## 文本层相关枚举

### TextLayerMode

定义文本层的渲染模式。

```javascript
const TextLayerMode = {
    DISABLE: 0,             // 禁用文本层
    ENABLE: 1,              // 启用文本层
    ENABLE_ENHANCE: 2       // 启用增强文本层
};

// 使用示例
const textLayerDiv = document.createElement('div');
const textLayer = new pdfjsLib.TextLayer({
    textLayerDiv: textLayerDiv,
    pageIndex: pageNumber - 1,
    viewport: viewport,
    textDivs: [],
    textContentItemsStr: [],
    enhanceTextSelection: true
});
```

## 错误和状态相关枚举

### PasswordResponses

定义密码响应类型。

```javascript
const PasswordResponses = {
    NEED_PASSWORD: 1,       // 需要密码
    INCORRECT_PASSWORD: 2   // 密码错误
};

// 使用示例
loadingTask.promise.catch(function(error) {
    if (error.name === 'PasswordException') {
        if (error.code === pdfjsLib.PasswordResponses.NEED_PASSWORD) {
            console.log('PDF需要密码');
        } else if (error.code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
            console.log('密码错误');
        }
    }
});
```

### InvalidPDFException

定义无效PDF异常类型。

```javascript
const InvalidPDFException = 'InvalidPDFException';

// 使用示例
try {
    const pdf = await pdfjsLib.getDocument(data).promise;
} catch (error) {
    if (error.name === pdfjsLib.InvalidPDFException) {
        console.log('无效的PDF文件');
    }
}
```

## 颜色和混合模式

### ColorSpace

定义颜色空间类型。

```javascript
const ColorSpace = {
    DEVICE_GRAY: 'DeviceGray',
    DEVICE_RGB: 'DeviceRGB',
    DEVICE_CMYK: 'DeviceCMYK',
    CAL_GRAY: 'CalGray',
    CAL_RGB: 'CalRGB',
    LAB: 'Lab',
    ICC_BASED: 'ICCBased',
    INDEXED: 'Indexed',
    PATTERN: 'Pattern',
    SEPARATION: 'Separation',
    DEVICE_N: 'DeviceN'
};
```

### BlendMode

定义混合模式。

```javascript
const BlendMode = {
    NORMAL: 'Normal',
    MULTIPLY: 'Multiply',
    SCREEN: 'Screen',
    OVERLAY: 'Overlay',
    SOFT_LIGHT: 'SoftLight',
    HARD_LIGHT: 'HardLight',
    COLOR_DODGE: 'ColorDodge',
    COLOR_BURN: 'ColorBurn',
    DARKEN: 'Darken',
    LIGHTEN: 'Lighten',
    DIFFERENCE: 'Difference',
    EXCLUSION: 'Exclusion',
    HUE: 'Hue',
    SATURATION: 'Saturation',
    COLOR: 'Color',
    LUMINOSITY: 'Luminosity'
};
```

## 字体相关枚举

### FontType

定义字体类型。

```javascript
const FontType = {
    TYPE1: 'Type1',
    TYPE1C: 'Type1C',
    CIDFONTTYPE0: 'CIDFontType0',
    CIDFONTTYPE0C: 'CIDFontType0C',
    TRUETYPE: 'TrueType',
    CIDFONTTYPE2: 'CIDFontType2',
    TYPE3: 'Type3',
    OPENTYPE: 'OpenType',
    TYPE0: 'Type0',
    MMTYPE1: 'MMType1'
};
```

## 完整示例

以下是一个使用多种常量和枚举的完整示例：

```html
<!DOCTYPE html>
<html>
<head>
    <title>PDF.js 常量和枚举示例</title>
    <style>
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .demo-section {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #007acc;
        }
        
        .demo-title {
            font-size: 18px;
            font-weight: bold;
            color: #007acc;
            margin-bottom: 15px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        
        .info-card {
            background: white;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
        }
        
        .info-title {
            font-weight: bold;
            color: #495057;
            margin-bottom: 10px;
        }
        
        .info-content {
            font-family: monospace;
            font-size: 12px;
            background: #f8f9fa;
            padding: 8px;
            border-radius: 3px;
            white-space: pre-wrap;
        }
        
        .controls {
            background: white;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
            margin: 15px 0;
        }
        
        .btn {
            padding: 8px 16px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
            font-size: 14px;
        }
        
        .btn:hover {
            background: #005a9e;
        }
        
        .btn.secondary {
            background: #6c757d;
        }
        
        .btn.secondary:hover {
            background: #545b62;
        }
        
        .result {
            background: #e8f5e8;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
        }
        
        .error {
            background: #ffe6e6;
            color: #d63384;
        }
        
        .viewer-container {
            border: 1px solid #ccc;
            border-radius: 4px;
            min-height: 400px;
            background: #f9f9f9;
            position: relative;
            overflow: hidden;
        }
        
        .pdf-canvas {
            max-width: 100%;
            display: block;
            margin: 0 auto;
        }
        
        .annotation-overlay {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
        }
        
        .annotation-item {
            position: absolute;
            border: 2px solid;
            background: rgba(255, 255, 0, 0.3);
            pointer-events: auto;
            cursor: pointer;
        }
        
        .annotation-link {
            border-color: #007acc;
            background: rgba(0, 122, 204, 0.2);
        }
        
        .annotation-highlight {
            border-color: #ffc107;
            background: rgba(255, 193, 7, 0.3);
        }
        
        .annotation-text {
            border-color: #dc3545;
            background: rgba(220, 53, 69, 0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PDF.js 常量和枚举示例</h1>
        
        <!-- 常量信息展示 -->
        <div class="demo-section">
            <div class="demo-title">常量和枚举信息</div>
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-title">渲染意图标志</div>
                    <div class="info-content" id="renderingIntentInfo"></div>
                </div>
                
                <div class="info-card">
                    <div class="info-title">注释类型</div>
                    <div class="info-content" id="annotationTypeInfo"></div>
                </div>
                
                <div class="info-card">
                    <div class="info-title">编辑器类型</div>
                    <div class="info-content" id="editorTypeInfo"></div>
                </div>
                
                <div class="info-card">
                    <div class="info-title">文本层模式</div>
                    <div class="info-content" id="textLayerModeInfo"></div>
                </div>
                
                <div class="info-card">
                    <div class="info-title">详细程度级别</div>
                    <div class="info-content" id="verbosityLevelInfo"></div>
                </div>
                
                <div class="info-card">
                    <div class="info-title">密码响应</div>
                    <div class="info-content" id="passwordResponsesInfo"></div>
                </div>
            </div>
        </div>
        
        <!-- PDF 查看器示例 -->
        <div class="demo-section">
            <div class="demo-title">PDF 查看器（使用常量配置）</div>
            
            <div class="controls">
                <input type="file" id="fileInput" accept=".pdf" style="margin-right: 10px;">
                <button class="btn" onclick="loadPDF()">加载 PDF</button>
                <button class="btn secondary" onclick="toggleAnnotations()">切换注释</button>
                <button class="btn secondary" onclick="toggleTextLayer()">切换文本层</button>
                <button class="btn secondary" onclick="changeVerbosity()">切换日志级别</button>
            </div>
            
            <div class="viewer-container">
                <canvas id="pdfCanvas" class="pdf-canvas"></canvas>
                <div id="textLayerDiv" class="text-layer"></div>
                <div id="annotationOverlay" class="annotation-overlay"></div>
            </div>
            
            <div id="pdfResult" class="result" style="display: none;"></div>
        </div>
        
        <!-- 注释分析示例 -->
        <div class="demo-section">
            <div class="demo-title">注释分析</div>
            
            <div class="controls">
                <button class="btn" onclick="analyzeAnnotations()">分析注释</button>
                <button class="btn secondary" onclick="filterAnnotations()">过滤注释</button>
            </div>
            
            <div id="annotationAnalysis" class="result" style="display: none;"></div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        // 设置 PDF.js Worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // 全局变量
        let currentPDF = null;
        let currentPage = null;
        let showAnnotations = true;
        let textLayerMode = pdfjsLib.TextLayerMode.ENABLE;
        let currentVerbosity = pdfjsLib.VerbosityLevel.WARNINGS;
        
        /**
         * 初始化常量信息显示
         */
        function initializeConstantsInfo() {
            // 渲染意图标志
            const renderingIntentInfo = [
                'DISPLAY: 0x01 (显示渲染)',
                'PRINT: 0x02 (打印渲染)',
                'ANNOTATIONS: 0x04 (包含注释)',
                'OPLIST: 0x08 (操作列表)',
                'FORMS: 0x10 (包含表单)'
            ].join('\n');
            document.getElementById('renderingIntentInfo').textContent = renderingIntentInfo;
            
            // 注释类型
            const annotationTypeInfo = [
                'TEXT: 1 (文本注释)',
                'LINK: 2 (链接注释)',
                'FREETEXT: 3 (自由文本)',
                'HIGHLIGHT: 9 (高亮注释)',
                'UNDERLINE: 10 (下划线)',
                'STRIKEOUT: 12 (删除线)',
                'INK: 15 (墨迹注释)',
                'WIDGET: 20 (小部件)'
            ].join('\n');
            document.getElementById('annotationTypeInfo').textContent = annotationTypeInfo;
            
            // 编辑器类型
            const editorTypeInfo = [
                'DISABLE: -1 (禁用)',
                'NONE: 0 (无)',
                'FREETEXT: 3 (自由文本编辑器)',
                'HIGHLIGHT: 9 (高亮编辑器)',
                'STAMP: 13 (印章编辑器)',
                'INK: 15 (墨迹编辑器)'
            ].join('\n');
            document.getElementById('editorTypeInfo').textContent = editorTypeInfo;
            
            // 文本层模式
            const textLayerModeInfo = [
                'DISABLE: 0 (禁用文本层)',
                'ENABLE: 1 (启用文本层)',
                'ENABLE_ENHANCE: 2 (增强文本层)'
            ].join('\n');
            document.getElementById('textLayerModeInfo').textContent = textLayerModeInfo;
            
            // 详细程度级别
            const verbosityLevelInfo = [
                'ERRORS: 0 (仅错误)',
                'WARNINGS: 1 (警告和错误)',
                'INFOS: 5 (所有信息)'
            ].join('\n');
            document.getElementById('verbosityLevelInfo').textContent = verbosityLevelInfo;
            
            // 密码响应
            const passwordResponsesInfo = [
                'NEED_PASSWORD: 1 (需要密码)',
                'INCORRECT_PASSWORD: 2 (密码错误)'
            ].join('\n');
            document.getElementById('passwordResponsesInfo').textContent = passwordResponsesInfo;
        }
        
        /**
         * 加载 PDF 文件
         */
        async function loadPDF() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                // 使用默认示例文件
                const url = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
                await loadPDFFromUrl(url);
                return;
            }
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                await loadPDFFromData(arrayBuffer);
            } catch (error) {
                showError('pdfResult', `加载失败: ${error.message}`);
            }
        }
        
        /**
         * 从URL加载PDF
         */
        async function loadPDFFromUrl(url) {
            try {
                showResult('pdfResult', '正在加载PDF...');
                
                const loadingTask = pdfjsLib.getDocument({
                    url: url,
                    verbosity: currentVerbosity
                });
                
                currentPDF = await loadingTask.promise;
                await renderFirstPage();
                
                showResult('pdfResult', `PDF加载成功\n页数: ${currentPDF.numPages}\n使用常量配置:\n- 详细程度: ${getVerbosityName(currentVerbosity)}\n- 文本层模式: ${getTextLayerModeName(textLayerMode)}\n- 显示注释: ${showAnnotations}`);
                
            } catch (error) {
                handlePDFError(error);
            }
        }
        
        /**
         * 从数据加载PDF
         */
        async function loadPDFFromData(data) {
            try {
                showResult('pdfResult', '正在加载PDF...');
                
                const loadingTask = pdfjsLib.getDocument({
                    data: data,
                    verbosity: currentVerbosity
                });
                
                currentPDF = await loadingTask.promise;
                await renderFirstPage();
                
                showResult('pdfResult', `PDF加载成功\n页数: ${currentPDF.numPages}\n文件大小: ${(data.byteLength / 1024).toFixed(1)} KB`);
                
            } catch (error) {
                handlePDFError(error);
            }
        }
        
        /**
         * 处理PDF错误
         */
        function handlePDFError(error) {
            let errorMessage = `加载失败: ${error.message}`;
            
            // 使用常量检查错误类型
            if (error.name === 'PasswordException') {
                if (error.code === pdfjsLib.PasswordResponses.NEED_PASSWORD) {
                    errorMessage += '\n错误类型: 需要密码 (NEED_PASSWORD)';
                } else if (error.code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
                    errorMessage += '\n错误类型: 密码错误 (INCORRECT_PASSWORD)';
                }
            } else if (error.name === 'InvalidPDFException') {
                errorMessage += '\n错误类型: 无效PDF文件';
            }
            
            showError('pdfResult', errorMessage);
        }
        
        /**
         * 渲染第一页
         */
        async function renderFirstPage() {
            if (!currentPDF) return;
            
            try {
                currentPage = await currentPDF.getPage(1);
                const viewport = currentPage.getViewport({ scale: 1.2 });
                
                const canvas = document.getElementById('pdfCanvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                // 设置渲染意图
                let intent = pdfjsLib.RenderingIntentFlag.DISPLAY;
                if (showAnnotations) {
                    intent |= pdfjsLib.RenderingIntentFlag.ANNOTATIONS;
                }
                
                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport,
                    intent: intent
                };
                
                await currentPage.render(renderContext).promise;
                
                // 渲染文本层
                if (textLayerMode !== pdfjsLib.TextLayerMode.DISABLE) {
                    await renderTextLayer(viewport);
                }
                
                // 渲染注释
                if (showAnnotations) {
                    await renderAnnotations(viewport);
                }
                
            } catch (error) {
                showError('pdfResult', `渲染失败: ${error.message}`);
            }
        }
        
        /**
         * 渲染文本层
         */
        async function renderTextLayer(viewport) {
            if (!currentPage) return;
            
            try {
                const textContent = await currentPage.getTextContent();
                const textLayerDiv = document.getElementById('textLayerDiv');
                
                // 清除现有文本层
                textLayerDiv.innerHTML = '';
                textLayerDiv.style.position = 'absolute';
                textLayerDiv.style.left = '0';
                textLayerDiv.style.top = '0';
                textLayerDiv.style.width = viewport.width + 'px';
                textLayerDiv.style.height = viewport.height + 'px';
                
                // 创建文本层
                const textLayer = new pdfjsLib.TextLayer({
                    textLayerDiv: textLayerDiv,
                    pageIndex: 0,
                    viewport: viewport,
                    textDivs: [],
                    textContentItemsStr: [],
                    enhanceTextSelection: textLayerMode === pdfjsLib.TextLayerMode.ENABLE_ENHANCE
                });
                
                textLayer.setTextContent(textContent);
                textLayer.render();
                
            } catch (error) {
                console.warn('文本层渲染失败:', error);
            }
        }
        
        /**
         * 渲染注释
         */
        async function renderAnnotations(viewport) {
            if (!currentPage) return;
            
            try {
                const annotations = await currentPage.getAnnotations();
                const overlay = document.getElementById('annotationOverlay');
                
                // 清除现有注释
                overlay.innerHTML = '';
                overlay.style.width = viewport.width + 'px';
                overlay.style.height = viewport.height + 'px';
                
                annotations.forEach((annotation, index) => {
                    const element = createAnnotationElement(annotation, viewport, index);
                    if (element) {
                        overlay.appendChild(element);
                    }
                });
                
            } catch (error) {
                console.warn('注释渲染失败:', error);
            }
        }
        
        /**
         * 创建注释元素
         */
        function createAnnotationElement(annotation, viewport, index) {
            if (!annotation.rect) return null;
            
            const rect = pdfjsLib.Util.normalizeRect(annotation.rect);
            const [x1, y1, x2, y2] = rect;
            
            const element = document.createElement('div');
            element.className = 'annotation-item';
            element.style.left = x1 + 'px';
            element.style.top = (viewport.height - y2) + 'px';
            element.style.width = (x2 - x1) + 'px';
            element.style.height = (y2 - y1) + 'px';
            
            // 根据注释类型设置样式
            const annotationType = annotation.annotationType;
            if (annotationType === pdfjsLib.AnnotationType.LINK) {
                element.classList.add('annotation-link');
                element.title = `链接注释: ${annotation.url || '内部链接'}`;
            } else if (annotationType === pdfjsLib.AnnotationType.HIGHLIGHT) {
                element.classList.add('annotation-highlight');
                element.title = '高亮注释';
            } else if (annotationType === pdfjsLib.AnnotationType.TEXT) {
                element.classList.add('annotation-text');
                element.title = `文本注释: ${annotation.contents || ''}`;
            } else {
                element.title = `注释类型: ${getAnnotationTypeName(annotationType)}`;
            }
            
            element.onclick = () => {
                showAnnotationInfo(annotation, index);
            };
            
            return element;
        }
        
        /**
         * 显示注释信息
         */
        function showAnnotationInfo(annotation, index) {
            const info = [
                `注释 #${index + 1}`,
                `类型: ${getAnnotationTypeName(annotation.annotationType)} (${annotation.annotationType})`,
                `标题: ${annotation.title || '无'}`,
                `内容: ${annotation.contents || '无'}`,
                `矩形: [${annotation.rect.join(', ')}]`,
                `标志: ${getAnnotationFlags(annotation.flags || 0)}`
            ].join('\n');
            
            showResult('pdfResult', info);
        }
        
        /**
         * 切换注释显示
         */
        function toggleAnnotations() {
            showAnnotations = !showAnnotations;
            if (currentPDF) {
                renderFirstPage();
            }
        }
        
        /**
         * 切换文本层
         */
        function toggleTextLayer() {
            const modes = [pdfjsLib.TextLayerMode.DISABLE, pdfjsLib.TextLayerMode.ENABLE, pdfjsLib.TextLayerMode.ENABLE_ENHANCE];
            const currentIndex = modes.indexOf(textLayerMode);
            textLayerMode = modes[(currentIndex + 1) % modes.length];
            
            if (currentPDF) {
                renderFirstPage();
            }
        }
        
        /**
         * 切换日志级别
         */
        function changeVerbosity() {
            const levels = [pdfjsLib.VerbosityLevel.ERRORS, pdfjsLib.VerbosityLevel.WARNINGS, pdfjsLib.VerbosityLevel.INFOS];
            const currentIndex = levels.indexOf(currentVerbosity);
            currentVerbosity = levels[(currentIndex + 1) % levels.length];
            
            pdfjsLib.GlobalWorkerOptions.verbosity = currentVerbosity;
            showResult('pdfResult', `日志级别已切换为: ${getVerbosityName(currentVerbosity)}`);
        }
        
        /**
         * 分析注释
         */
        async function analyzeAnnotations() {
            if (!currentPage) {
                showError('annotationAnalysis', '请先加载PDF文件');
                return;
            }
            
            try {
                const annotations = await currentPage.getAnnotations();
                
                // 统计注释类型
                const typeStats = {};
                const flagStats = {};
                
                annotations.forEach(annotation => {
                    const typeName = getAnnotationTypeName(annotation.annotationType);
                    typeStats[typeName] = (typeStats[typeName] || 0) + 1;
                    
                    const flags = annotation.flags || 0;
                    Object.keys(pdfjsLib.AnnotationFlag).forEach(flagName => {
                        const flagValue = pdfjsLib.AnnotationFlag[flagName];
                        if (flags & flagValue) {
                            flagStats[flagName] = (flagStats[flagName] || 0) + 1;
                        }
                    });
                });
                
                const analysis = [
                    `注释分析结果:`,
                    `总数: ${annotations.length}`,
                    '',
                    '类型分布:',
                    ...Object.entries(typeStats).map(([type, count]) => `  ${type}: ${count}`),
                    '',
                    '标志分布:',
                    ...Object.entries(flagStats).map(([flag, count]) => `  ${flag}: ${count}`)
                ].join('\n');
                
                showResult('annotationAnalysis', analysis);
                
            } catch (error) {
                showError('annotationAnalysis', `分析失败: ${error.message}`);
            }
        }
        
        /**
         * 过滤注释
         */
        async function filterAnnotations() {
            if (!currentPage) {
                showError('annotationAnalysis', '请先加载PDF文件');
                return;
            }
            
            try {
                const annotations = await currentPage.getAnnotations();
                
                // 按类型过滤
                const linkAnnotations = annotations.filter(a => a.annotationType === pdfjsLib.AnnotationType.LINK);
                const textAnnotations = annotations.filter(a => a.annotationType === pdfjsLib.AnnotationType.TEXT);
                const highlightAnnotations = annotations.filter(a => a.annotationType === pdfjsLib.AnnotationType.HIGHLIGHT);
                
                // 按标志过滤
                const printableAnnotations = annotations.filter(a => (a.flags & pdfjsLib.AnnotationFlag.PRINT) !== 0);
                const hiddenAnnotations = annotations.filter(a => (a.flags & pdfjsLib.AnnotationFlag.HIDDEN) !== 0);
                
                const filterResult = [
                    '注释过滤结果:',
                    '',
                    `链接注释: ${linkAnnotations.length}`,
                    `文本注释: ${textAnnotations.length}`,
                    `高亮注释: ${highlightAnnotations.length}`,
                    '',
                    `可打印注释: ${printableAnnotations.length}`,
                    `隐藏注释: ${hiddenAnnotations.length}`,
                    '',
                    '链接注释详情:',
                    ...linkAnnotations.map((a, i) => `  ${i + 1}. ${a.url || '内部链接'}`)
                ].join('\n');
                
                showResult('annotationAnalysis', filterResult);
                
            } catch (error) {
                showError('annotationAnalysis', `过滤失败: ${error.message}`);
            }
        }
        
        /**
         * 获取注释类型名称
         */
        function getAnnotationTypeName(type) {
            const typeNames = {
                1: 'TEXT',
                2: 'LINK',
                3: 'FREETEXT',
                4: 'LINE',
                5: 'SQUARE',
                6: 'CIRCLE',
                9: 'HIGHLIGHT',
                10: 'UNDERLINE',
                12: 'STRIKEOUT',
                15: 'INK',
                20: 'WIDGET'
            };
            return typeNames[type] || `UNKNOWN(${type})`;
        }
        
        /**
         * 获取注释标志描述
         */
        function getAnnotationFlags(flags) {
            const flagNames = [];
            const flagMap = {
                0x01: 'INVISIBLE',
                0x02: 'HIDDEN',
                0x04: 'PRINT',
                0x08: 'NOZOOM',
                0x10: 'NOROTATE',
                0x20: 'NOVIEW',
                0x40: 'READONLY',
                0x80: 'LOCKED'
            };
            
            Object.entries(flagMap).forEach(([value, name]) => {
                if (flags & parseInt(value)) {
                    flagNames.push(name);
                }
            });
            
            return flagNames.length > 0 ? flagNames.join(', ') : 'NONE';
        }
        
        /**
         * 获取详细程度级别名称
         */
        function getVerbosityName(level) {
            const names = {
                0: 'ERRORS',
                1: 'WARNINGS',
                5: 'INFOS'
            };
            return names[level] || `UNKNOWN(${level})`;
        }
        
        /**
         * 获取文本层模式名称
         */
        function getTextLayerModeName(mode) {
            const names = {
                0: 'DISABLE',
                1: 'ENABLE',
                2: 'ENABLE_ENHANCE'
            };
            return names[mode] || `UNKNOWN(${mode})`;
        }
        
        /**
         * 显示结果
         */
        function showResult(elementId, message) {
            const result = document.getElementById(elementId);
            result.className = 'result';
            result.style.display = 'block';
            result.textContent = message;
        }
        
        /**
         * 显示错误
         */
        function showError(elementId, message) {
            const result = document.getElementById(elementId);
            result.className = 'result error';
            result.style.display = 'block';
            result.textContent = message;
        }
        
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            initializeConstantsInfo();
        });
    </script>
</body>
</html>
```

## 实用工具函数

### 常量检查工具

```javascript
/**
 * 常量和枚举检查工具
 */
class PDFConstantsHelper {
    /**
     * 检查渲染意图
     */
    static hasRenderingIntent(intent, flag) {
        return (intent & flag) !== 0;
    }
    
    /**
     * 组合渲染意图
     */
    static combineRenderingIntents(...intents) {
        return intents.reduce((combined, intent) => combined | intent, 0);
    }
    
    /**
     * 检查注释标志
     */
    static hasAnnotationFlag(flags, flag) {
        return (flags & flag) !== 0;
    }
    
    /**
     * 获取注释类型描述
     */
    static getAnnotationTypeDescription(type) {
        const descriptions = {
            [pdfjsLib.AnnotationType.TEXT]: '文本注释 - 用于添加注释文本',
            [pdfjsLib.AnnotationType.LINK]: '链接注释 - 可点击的链接',
            [pdfjsLib.AnnotationType.FREETEXT]: '自由文本 - 直接显示的文本',
            [pdfjsLib.AnnotationType.HIGHLIGHT]: '高亮注释 - 高亮显示文本',
            [pdfjsLib.AnnotationType.UNDERLINE]: '下划线注释 - 在文本下方添加线条',
            [pdfjsLib.AnnotationType.STRIKEOUT]: '删除线注释 - 在文本上方添加线条',
            [pdfjsLib.AnnotationType.INK]: '墨迹注释 - 手绘线条和形状',
            [pdfjsLib.AnnotationType.WIDGET]: '小部件注释 - 表单字段'
        };
        
        return descriptions[type] || `未知注释类型 (${type})`;
    }
    
    /**
     * 验证编辑器类型
     */
    static isValidEditorType(type) {
        const validTypes = [
            pdfjsLib.AnnotationEditorType.DISABLE,
            pdfjsLib.AnnotationEditorType.NONE,
            pdfjsLib.AnnotationEditorType.FREETEXT,
            pdfjsLib.AnnotationEditorType.HIGHLIGHT,
            pdfjsLib.AnnotationEditorType.STAMP,
            pdfjsLib.AnnotationEditorType.INK
        ];
        
        return validTypes.includes(type);
    }
    
    /**
     * 获取推荐的渲染配置
     */
    static getRecommendedRenderConfig(purpose) {
        const configs = {
            display: {
                intent: pdfjsLib.RenderingIntentFlag.DISPLAY | pdfjsLib.RenderingIntentFlag.ANNOTATIONS,
                textLayerMode: pdfjsLib.TextLayerMode.ENABLE,
                verbosity: pdfjsLib.VerbosityLevel.WARNINGS
            },
            print: {
                intent: pdfjsLib.RenderingIntentFlag.PRINT | pdfjsLib.RenderingIntentFlag.ANNOTATIONS,
                textLayerMode: pdfjsLib.TextLayerMode.DISABLE,
                verbosity: pdfjsLib.VerbosityLevel.ERRORS
            },
            editing: {
                intent: pdfjsLib.RenderingIntentFlag.DISPLAY | pdfjsLib.RenderingIntentFlag.ANNOTATIONS | pdfjsLib.RenderingIntentFlag.FORMS,
                textLayerMode: pdfjsLib.TextLayerMode.ENABLE_ENHANCE,
                verbosity: pdfjsLib.VerbosityLevel.INFOS
            }
        };
        
        return configs[purpose] || configs.display;
    }
}

// 使用示例
const displayConfig = PDFConstantsHelper.getRecommendedRenderConfig('display');
console.log('显示配置:', displayConfig);

const hasAnnotations = PDFConstantsHelper.hasRenderingIntent(
    displayConfig.intent,
    pdfjsLib.RenderingIntentFlag.ANNOTATIONS
);
console.log('包含注释:', hasAnnotations);
```

## 最佳实践

1. **使用常量而非硬编码**：始终使用 PDF.js 提供的常量，避免硬编码数值
2. **位运算操作**：正确使用位运算来组合和检查标志位
3. **类型验证**：在使用枚举值前进行有效性验证
4. **错误处理**：根据错误类型常量提供相应的用户反馈
5. **性能优化**：根据使用场景选择合适的渲染配置
6. **兼容性考虑**：检查 PDF.js 版本以确保常量可用性

## 注意事项

1. **版本差异**：不同版本的 PDF.js 可能有不同的常量定义
2. **浏览器兼容性**：某些常量可能需要特定的浏览器支持
3. **性能影响**：某些渲染意图组合可能影响性能
4. **内存使用**：启用所有功能可能增加内存消耗
5. **调试信息**：高详细程度级别会产生大量日志输出

## 相关链接

- [GlobalWorkerOptions](/api/global-worker-options)
- [AnnotationLayer](/api/annotation-layer)
- [TextLayer](/api/text-layer)
- [AnnotationEditorUIManager](/api/annotation-editor-ui-manager)
- [错误处理指南](/guide/error-handling)
- [性能优化指南](/guide/performance)