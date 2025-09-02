# Util

`Util` 是 PDF.js 中的实用工具类，提供了一系列静态方法来处理常见的数据转换、格式化和计算任务。这些工具函数在 PDF 处理过程中经常被使用。

## 概述

`Util` 类主要提供以下功能：
- 数据类型转换和验证
- 数组和对象操作
- 数学计算和几何变换
- 字符串处理和格式化
- 颜色空间转换
- 坐标系统变换

## 主要方法

### 数据转换方法

#### Util.normalizeUnicode(str)

标准化 Unicode 字符串。

**参数：**
- `str` (string): 要标准化的字符串

**返回值：** (string) 标准化后的字符串

```javascript
const normalized = pdfjsLib.Util.normalizeUnicode('café');
console.log(normalized); // 标准化的字符串
```

#### Util.bytesToString(bytes)

将字节数组转换为字符串。

**参数：**
- `bytes` (Uint8Array): 字节数组

**返回值：** (string) 转换后的字符串

```javascript
const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
const str = pdfjsLib.Util.bytesToString(bytes);
console.log(str); // "Hello"
```

#### Util.stringToBytes(str)

将字符串转换为字节数组。

**参数：**
- `str` (string): 要转换的字符串

**返回值：** (Uint8Array) 字节数组

```javascript
const str = "Hello";
const bytes = pdfjsLib.Util.stringToBytes(str);
console.log(bytes); // Uint8Array [72, 101, 108, 108, 111]
```

### 数组操作方法

#### Util.arrayBuffersToBytes(buffers)

将多个 ArrayBuffer 合并为单个字节数组。

**参数：**
- `buffers` (ArrayBuffer[]): ArrayBuffer 数组

**返回值：** (Uint8Array) 合并后的字节数组

```javascript
const buffer1 = new ArrayBuffer(4);
const buffer2 = new ArrayBuffer(4);
const view1 = new Uint8Array(buffer1);
const view2 = new Uint8Array(buffer2);

view1.set([1, 2, 3, 4]);
view2.set([5, 6, 7, 8]);

const combined = pdfjsLib.Util.arrayBuffersToBytes([buffer1, buffer2]);
console.log(combined); // Uint8Array [1, 2, 3, 4, 5, 6, 7, 8]
```

### 数学和几何方法

#### Util.transform(m1, m2)

执行矩阵变换。

**参数：**
- `m1` (Array): 第一个变换矩阵 [a, b, c, d, e, f]
- `m2` (Array): 第二个变换矩阵 [a, b, c, d, e, f]

**返回值：** (Array) 变换结果矩阵

```javascript
// 平移变换
const translate = [1, 0, 0, 1, 100, 50];
// 缩放变换
const scale = [2, 0, 0, 2, 0, 0];

const result = pdfjsLib.Util.transform(translate, scale);
console.log(result); // 组合变换矩阵
```

#### Util.applyTransform(p, m)

将变换矩阵应用到点坐标。

**参数：**
- `p` (Array): 点坐标 [x, y]
- `m` (Array): 变换矩阵 [a, b, c, d, e, f]

**返回值：** (Array) 变换后的点坐标 [x', y']

```javascript
const point = [10, 20];
const matrix = [2, 0, 0, 2, 100, 50]; // 缩放2倍并平移

const transformed = pdfjsLib.Util.applyTransform(point, matrix);
console.log(transformed); // [120, 90]
```

#### Util.inverseTransform(m)

计算变换矩阵的逆矩阵。

**参数：**
- `m` (Array): 变换矩阵 [a, b, c, d, e, f]

**返回值：** (Array) 逆变换矩阵

```javascript
const matrix = [2, 0, 0, 2, 100, 50];
const inverse = pdfjsLib.Util.inverseTransform(matrix);
console.log(inverse); // 逆变换矩阵
```

### 颜色处理方法

#### Util.makeCssRgb(r, g, b)

创建 CSS RGB 颜色字符串。

**参数：**
- `r` (number): 红色分量 (0-255)
- `g` (number): 绿色分量 (0-255)
- `b` (number): 蓝色分量 (0-255)

**返回值：** (string) CSS RGB 字符串

```javascript
const cssColor = pdfjsLib.Util.makeCssRgb(255, 128, 0);
console.log(cssColor); // "rgb(255,128,0)"
```

#### Util.scaleMinMax(transform, minMax)

根据变换矩阵缩放最小最大值。

**参数：**
- `transform` (Array): 变换矩阵
- `minMax` (Array): 最小最大值 [xMin, xMax, yMin, yMax]

**返回值：** (Array) 缩放后的最小最大值

```javascript
const transform = [2, 0, 0, 2, 0, 0]; // 缩放2倍
const bounds = [0, 100, 0, 50];

const scaledBounds = pdfjsLib.Util.scaleMinMax(transform, bounds);
console.log(scaledBounds); // [0, 200, 0, 100]
```

## 完整示例

以下是一个使用 `Util` 类进行各种数据处理的完整示例：

```html
<!DOCTYPE html>
<html>
<head>
    <title>PDF.js Util 工具类示例</title>
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
        
        .demo-content {
            background: white;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
        }
        
        .input-group {
            margin: 10px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .input-group label {
            min-width: 120px;
            font-weight: bold;
        }
        
        .input-group input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        
        .btn {
            padding: 8px 16px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn:hover {
            background: #005a9e;
        }
        
        .result {
            background: #e8f5e8;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-family: monospace;
            white-space: pre-wrap;
        }
        
        .error {
            background: #ffe6e6;
            color: #d63384;
        }
        
        .canvas-container {
            text-align: center;
            margin: 20px 0;
        }
        
        .transform-canvas {
            border: 1px solid #ccc;
            background: white;
        }
        
        .color-preview {
            width: 50px;
            height: 30px;
            border: 1px solid #ccc;
            border-radius: 4px;
            display: inline-block;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PDF.js Util 工具类示例</h1>
        
        <!-- 字符串转换示例 -->
        <div class="demo-section">
            <div class="demo-title">字符串和字节转换</div>
            <div class="demo-content">
                <div class="input-group">
                    <label>输入字符串:</label>
                    <input type="text" id="stringInput" value="Hello, 世界!" placeholder="输入要转换的字符串">
                    <button class="btn" onclick="convertString()">转换为字节</button>
                </div>
                
                <div class="input-group">
                    <label>输入字节数组:</label>
                    <input type="text" id="bytesInput" value="72,101,108,108,111" placeholder="用逗号分隔的字节值">
                    <button class="btn" onclick="convertBytes()">转换为字符串</button>
                </div>
                
                <div id="stringResult" class="result" style="display: none;"></div>
            </div>
        </div>
        
        <!-- 矩阵变换示例 -->
        <div class="demo-section">
            <div class="demo-title">矩阵变换</div>
            <div class="demo-content">
                <div class="input-group">
                    <label>点坐标 (x,y):</label>
                    <input type="text" id="pointInput" value="50,30" placeholder="x,y">
                </div>
                
                <div class="input-group">
                    <label>平移 (dx,dy):</label>
                    <input type="text" id="translateInput" value="100,50" placeholder="dx,dy">
                </div>
                
                <div class="input-group">
                    <label>缩放 (sx,sy):</label>
                    <input type="text" id="scaleInput" value="2,1.5" placeholder="sx,sy">
                </div>
                
                <div class="input-group">
                    <label>旋转角度 (度):</label>
                    <input type="text" id="rotateInput" value="45" placeholder="角度">
                    <button class="btn" onclick="applyTransform()">应用变换</button>
                </div>
                
                <div class="canvas-container">
                    <canvas id="transformCanvas" class="transform-canvas" width="400" height="300"></canvas>
                </div>
                
                <div id="transformResult" class="result" style="display: none;"></div>
            </div>
        </div>
        
        <!-- 颜色处理示例 -->
        <div class="demo-section">
            <div class="demo-title">颜色处理</div>
            <div class="demo-content">
                <div class="input-group">
                    <label>红色 (0-255):</label>
                    <input type="number" id="redInput" value="255" min="0" max="255">
                </div>
                
                <div class="input-group">
                    <label>绿色 (0-255):</label>
                    <input type="number" id="greenInput" value="128" min="0" max="255">
                </div>
                
                <div class="input-group">
                    <label>蓝色 (0-255):</label>
                    <input type="number" id="blueInput" value="0" min="0" max="255">
                    <button class="btn" onclick="generateColor()">生成颜色</button>
                    <div id="colorPreview" class="color-preview"></div>
                </div>
                
                <div id="colorResult" class="result" style="display: none;"></div>
            </div>
        </div>
        
        <!-- 数组操作示例 -->
        <div class="demo-section">
            <div class="demo-title">数组操作</div>
            <div class="demo-content">
                <div class="input-group">
                    <label>数组1:</label>
                    <input type="text" id="array1Input" value="1,2,3,4" placeholder="用逗号分隔的数字">
                </div>
                
                <div class="input-group">
                    <label>数组2:</label>
                    <input type="text" id="array2Input" value="5,6,7,8" placeholder="用逗号分隔的数字">
                    <button class="btn" onclick="combineArrays()">合并数组</button>
                </div>
                
                <div id="arrayResult" class="result" style="display: none;"></div>
            </div>
        </div>
        
        <!-- Unicode 标准化示例 -->
        <div class="demo-section">
            <div class="demo-title">Unicode 标准化</div>
            <div class="demo-content">
                <div class="input-group">
                    <label>输入文本:</label>
                    <input type="text" id="unicodeInput" value="café naïve résumé" placeholder="包含重音符号的文本">
                    <button class="btn" onclick="normalizeUnicode()">标准化</button>
                </div>
                
                <div id="unicodeResult" class="result" style="display: none;"></div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        // 设置 PDF.js Worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        /**
         * 字符串转字节数组
         */
        function convertString() {
            try {
                const input = document.getElementById('stringInput').value;
                const bytes = pdfjsLib.Util.stringToBytes(input);
                
                const result = document.getElementById('stringResult');
                result.className = 'result';
                result.style.display = 'block';
                result.textContent = `字符串: "${input}"\n字节数组: [${Array.from(bytes).join(', ')}]\n长度: ${bytes.length} 字节`;
            } catch (error) {
                showError('stringResult', error.message);
            }
        }
        
        /**
         * 字节数组转字符串
         */
        function convertBytes() {
            try {
                const input = document.getElementById('bytesInput').value;
                const byteValues = input.split(',').map(s => parseInt(s.trim()));
                
                // 验证字节值
                if (byteValues.some(b => isNaN(b) || b < 0 || b > 255)) {
                    throw new Error('字节值必须在 0-255 范围内');
                }
                
                const bytes = new Uint8Array(byteValues);
                const str = pdfjsLib.Util.bytesToString(bytes);
                
                const result = document.getElementById('stringResult');
                result.className = 'result';
                result.style.display = 'block';
                result.textContent = `字节数组: [${byteValues.join(', ')}]\n字符串: "${str}"\n长度: ${str.length} 字符`;
            } catch (error) {
                showError('stringResult', error.message);
            }
        }
        
        /**
         * 应用矩阵变换
         */
        function applyTransform() {
            try {
                // 解析输入
                const pointStr = document.getElementById('pointInput').value;
                const translateStr = document.getElementById('translateInput').value;
                const scaleStr = document.getElementById('scaleInput').value;
                const rotateStr = document.getElementById('rotateInput').value;
                
                const [x, y] = pointStr.split(',').map(s => parseFloat(s.trim()));
                const [dx, dy] = translateStr.split(',').map(s => parseFloat(s.trim()));
                const [sx, sy] = scaleStr.split(',').map(s => parseFloat(s.trim()));
                const angle = parseFloat(rotateStr.trim()) * Math.PI / 180; // 转换为弧度
                
                // 创建变换矩阵
                const translateMatrix = [1, 0, 0, 1, dx, dy];
                const scaleMatrix = [sx, 0, 0, sy, 0, 0];
                const rotateMatrix = [
                    Math.cos(angle), Math.sin(angle),
                    -Math.sin(angle), Math.cos(angle),
                    0, 0
                ];
                
                // 组合变换：先缩放，再旋转，最后平移
                let combinedMatrix = pdfjsLib.Util.transform(scaleMatrix, rotateMatrix);
                combinedMatrix = pdfjsLib.Util.transform(combinedMatrix, translateMatrix);
                
                // 应用变换到点
                const originalPoint = [x, y];
                const transformedPoint = pdfjsLib.Util.applyTransform(originalPoint, combinedMatrix);
                
                // 显示结果
                const result = document.getElementById('transformResult');
                result.className = 'result';
                result.style.display = 'block';
                result.textContent = `原始点: (${x}, ${y})\n变换后: (${transformedPoint[0].toFixed(2)}, ${transformedPoint[1].toFixed(2)})\n\n变换矩阵: [${combinedMatrix.map(v => v.toFixed(3)).join(', ')}]`;
                
                // 在画布上绘制变换效果
                drawTransformation(originalPoint, transformedPoint, combinedMatrix);
                
            } catch (error) {
                showError('transformResult', error.message);
            }
        }
        
        /**
         * 在画布上绘制变换效果
         */
        function drawTransformation(originalPoint, transformedPoint, matrix) {
            const canvas = document.getElementById('transformCanvas');
            const ctx = canvas.getContext('2d');
            
            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 设置坐标系原点到画布中心
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            
            // 绘制坐标轴
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, 0);
            ctx.moveTo(0, -canvas.height / 2);
            ctx.lineTo(0, canvas.height / 2);
            ctx.stroke();
            
            // 绘制原始点
            ctx.fillStyle = '#007acc';
            ctx.beginPath();
            ctx.arc(originalPoint[0], -originalPoint[1], 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // 标注原始点
            ctx.fillStyle = '#007acc';
            ctx.font = '12px Arial';
            ctx.fillText(`原始 (${originalPoint[0]}, ${originalPoint[1]})`, originalPoint[0] + 10, -originalPoint[1] - 10);
            
            // 绘制变换后的点
            ctx.fillStyle = '#dc3545';
            ctx.beginPath();
            ctx.arc(transformedPoint[0], -transformedPoint[1], 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // 标注变换后的点
            ctx.fillStyle = '#dc3545';
            ctx.fillText(`变换后 (${transformedPoint[0].toFixed(1)}, ${transformedPoint[1].toFixed(1)})`, transformedPoint[0] + 10, -transformedPoint[1] + 20);
            
            // 绘制连接线
            ctx.strokeStyle = '#28a745';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(originalPoint[0], -originalPoint[1]);
            ctx.lineTo(transformedPoint[0], -transformedPoint[1]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.restore();
        }
        
        /**
         * 生成CSS颜色
         */
        function generateColor() {
            try {
                const r = parseInt(document.getElementById('redInput').value);
                const g = parseInt(document.getElementById('greenInput').value);
                const b = parseInt(document.getElementById('blueInput').value);
                
                // 验证颜色值
                if ([r, g, b].some(v => isNaN(v) || v < 0 || v > 255)) {
                    throw new Error('颜色值必须在 0-255 范围内');
                }
                
                const cssColor = pdfjsLib.Util.makeCssRgb(r, g, b);
                
                // 更新颜色预览
                const preview = document.getElementById('colorPreview');
                preview.style.backgroundColor = cssColor;
                
                // 显示结果
                const result = document.getElementById('colorResult');
                result.className = 'result';
                result.style.display = 'block';
                result.textContent = `RGB 值: (${r}, ${g}, ${b})\nCSS 颜色: ${cssColor}\n十六进制: #${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
                
            } catch (error) {
                showError('colorResult', error.message);
            }
        }
        
        /**
         * 合并数组
         */
        function combineArrays() {
            try {
                const array1Str = document.getElementById('array1Input').value;
                const array2Str = document.getElementById('array2Input').value;
                
                const array1 = array1Str.split(',').map(s => parseInt(s.trim()));
                const array2 = array2Str.split(',').map(s => parseInt(s.trim()));
                
                // 验证数组值
                if ([...array1, ...array2].some(v => isNaN(v))) {
                    throw new Error('数组中包含无效的数字');
                }
                
                // 创建 ArrayBuffer
                const buffer1 = new ArrayBuffer(array1.length);
                const buffer2 = new ArrayBuffer(array2.length);
                const view1 = new Uint8Array(buffer1);
                const view2 = new Uint8Array(buffer2);
                
                view1.set(array1.map(v => Math.max(0, Math.min(255, v))));
                view2.set(array2.map(v => Math.max(0, Math.min(255, v))));
                
                // 合并数组
                const combined = pdfjsLib.Util.arrayBuffersToBytes([buffer1, buffer2]);
                
                const result = document.getElementById('arrayResult');
                result.className = 'result';
                result.style.display = 'block';
                result.textContent = `数组1: [${array1.join(', ')}]\n数组2: [${array2.join(', ')}]\n合并结果: [${Array.from(combined).join(', ')}]\n总长度: ${combined.length}`;
                
            } catch (error) {
                showError('arrayResult', error.message);
            }
        }
        
        /**
         * Unicode 标准化
         */
        function normalizeUnicode() {
            try {
                const input = document.getElementById('unicodeInput').value;
                const normalized = pdfjsLib.Util.normalizeUnicode(input);
                
                // 获取字符编码信息
                const getCharCodes = (str) => {
                    return Array.from(str).map(char => {
                        const code = char.charCodeAt(0);
                        return `${char} (U+${code.toString(16).toUpperCase().padStart(4, '0')})`;
                    }).join(', ');
                };
                
                const result = document.getElementById('unicodeResult');
                result.className = 'result';
                result.style.display = 'block';
                result.textContent = `原始文本: "${input}"\n原始编码: ${getCharCodes(input)}\n\n标准化文本: "${normalized}"\n标准化编码: ${getCharCodes(normalized)}\n\n长度变化: ${input.length} → ${normalized.length}`;
                
            } catch (error) {
                showError('unicodeResult', error.message);
            }
        }
        
        /**
         * 显示错误信息
         */
        function showError(elementId, message) {
            const result = document.getElementById(elementId);
            result.className = 'result error';
            result.style.display = 'block';
            result.textContent = `错误: ${message}`;
        }
        
        // 初始化示例
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化颜色预览
            generateColor();
            
            // 初始化变换画布
            applyTransform();
        });
    </script>
</body>
</html>
```

## 高级用法

### 自定义工具函数

```javascript
/**
 * 扩展 Util 类的功能
 */
class ExtendedUtil {
    /**
     * 批量字符串转换
     */
    static batchStringToBytes(strings) {
        return strings.map(str => pdfjsLib.Util.stringToBytes(str));
    }
    
    /**
     * 计算边界框
     */
    static calculateBoundingBox(points, transform) {
        const transformedPoints = points.map(point => 
            pdfjsLib.Util.applyTransform(point, transform)
        );
        
        const xs = transformedPoints.map(p => p[0]);
        const ys = transformedPoints.map(p => p[1]);
        
        return {
            left: Math.min(...xs),
            right: Math.max(...xs),
            top: Math.min(...ys),
            bottom: Math.max(...ys)
        };
    }
    
    /**
     * 颜色空间转换
     */
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // 无色
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }
    
    /**
     * 创建复合变换矩阵
     */
    static createCompositeTransform(operations) {
        let matrix = [1, 0, 0, 1, 0, 0]; // 单位矩阵
        
        for (const op of operations) {
            let opMatrix;
            
            switch (op.type) {
                case 'translate':
                    opMatrix = [1, 0, 0, 1, op.x || 0, op.y || 0];
                    break;
                case 'scale':
                    opMatrix = [op.x || 1, 0, 0, op.y || 1, 0, 0];
                    break;
                case 'rotate':
                    const angle = (op.angle || 0) * Math.PI / 180;
                    opMatrix = [
                        Math.cos(angle), Math.sin(angle),
                        -Math.sin(angle), Math.cos(angle),
                        0, 0
                    ];
                    break;
                default:
                    continue;
            }
            
            matrix = pdfjsLib.Util.transform(matrix, opMatrix);
        }
        
        return matrix;
    }
}

// 使用示例
const operations = [
    { type: 'scale', x: 2, y: 2 },
    { type: 'rotate', angle: 45 },
    { type: 'translate', x: 100, y: 50 }
];

const compositeMatrix = ExtendedUtil.createCompositeTransform(operations);
console.log('复合变换矩阵:', compositeMatrix);
```

### 性能优化工具

```javascript
/**
 * 性能优化的工具函数
 */
class PerformanceUtil {
    /**
     * 批量矩阵变换（使用 Web Workers）
     */
    static async batchTransform(points, matrix) {
        return new Promise((resolve) => {
            const worker = new Worker(URL.createObjectURL(new Blob([
                `
                self.onmessage = function(e) {
                    const { points, matrix } = e.data;
                    const results = points.map(point => {
                        const [x, y] = point;
                        const [a, b, c, d, e, f] = matrix;
                        return [
                            a * x + c * y + e,
                            b * x + d * y + f
                        ];
                    });
                    self.postMessage(results);
                };
                `
            ], { type: 'application/javascript' })));
            
            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
            };
            
            worker.postMessage({ points, matrix });
        });
    }
    
    /**
     * 缓存的字符串转换
     */
    static createCachedStringConverter() {
        const cache = new Map();
        
        return {
            stringToBytes: (str) => {
                if (cache.has(str)) {
                    return cache.get(str);
                }
                const bytes = pdfjsLib.Util.stringToBytes(str);
                cache.set(str, bytes);
                return bytes;
            },
            
            bytesToString: (bytes) => {
                const key = bytes.join(',');
                if (cache.has(key)) {
                    return cache.get(key);
                }
                const str = pdfjsLib.Util.bytesToString(bytes);
                cache.set(key, str);
                return str;
            },
            
            clearCache: () => cache.clear(),
            getCacheSize: () => cache.size
        };
    }
}

// 使用示例
const converter = PerformanceUtil.createCachedStringConverter();
const bytes1 = converter.stringToBytes('Hello'); // 计算并缓存
const bytes2 = converter.stringToBytes('Hello'); // 从缓存获取
console.log('缓存大小:', converter.getCacheSize());
```

## 注意事项

1. **数据类型验证**：使用前验证输入数据的类型和范围
2. **性能考虑**：对于大量数据处理，考虑使用批处理或 Web Workers
3. **内存管理**：及时清理不需要的大型数组和缓存
4. **精度问题**：浮点数计算可能存在精度误差
5. **浏览器兼容性**：某些方法可能需要 polyfill
6. **错误处理**：实现适当的错误捕获和处理机制

## 相关链接

- [PDFWorker](/api/pdf-worker)
- [PDFDataRangeTransport](/api/pdf-data-range-transport)
- [GlobalWorkerOptions](/api/global-worker-options)
- [性能优化指南](/guide/performance)
- [错误处理](/guide/error-handling)