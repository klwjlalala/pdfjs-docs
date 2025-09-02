# ColorPicker

`ColorPicker` 是 PDF.js 中用于注释编辑器的颜色选择组件。它提供了一个用户友好的界面来选择和管理颜色，支持多种颜色格式和预设颜色。

## 概述

`ColorPicker` 组件主要用于：
- 为注释编辑器提供颜色选择功能
- 支持RGB、HEX、HSL等多种颜色格式
- 提供预设颜色面板
- 支持自定义颜色输入
- 颜色历史记录管理

## 主要方法

### constructor(options)

创建一个新的 `ColorPicker` 实例。

**参数：**
- `options` (Object): 配置选项
  - `container` (HTMLElement): 颜色选择器容器
  - `uiManager` (AnnotationEditorUIManager): UI管理器实例
  - `eventBus` (EventBus): 事件总线

```javascript
const colorPicker = new pdfjsLib.ColorPicker({
    container: document.getElementById('colorPickerContainer'),
    uiManager: uiManager,
    eventBus: eventBus
});
```

### show(currentColor, callback)

显示颜色选择器。

**参数：**
- `currentColor` (string): 当前颜色值（HEX格式）
- `callback` (Function): 颜色选择回调函数

```javascript
colorPicker.show('#FF0000', (selectedColor) => {
    console.log('选中的颜色:', selectedColor);
    // 应用颜色到编辑器
    editor.setColor(selectedColor);
});
```

### hide()

隐藏颜色选择器。

```javascript
colorPicker.hide();
```

### setColor(color)

设置当前颜色。

**参数：**
- `color` (string): 颜色值（支持HEX、RGB、HSL格式）

```javascript
// 设置HEX颜色
colorPicker.setColor('#FF0000');

// 设置RGB颜色
colorPicker.setColor('rgb(255, 0, 0)');

// 设置HSL颜色
colorPicker.setColor('hsl(0, 100%, 50%)');
```

### getColor()

获取当前选中的颜色。

**返回值：**
- `string`: 当前颜色的HEX值

```javascript
const currentColor = colorPicker.getColor();
console.log('当前颜色:', currentColor); // 输出: #FF0000
```

### addToHistory(color)

将颜色添加到历史记录。

**参数：**
- `color` (string): 要添加的颜色值

```javascript
colorPicker.addToHistory('#FF0000');
colorPicker.addToHistory('#00FF00');
colorPicker.addToHistory('#0000FF');
```

### clearHistory()

清除颜色历史记录。

```javascript
colorPicker.clearHistory();
```

## 完整示例

以下是一个完整的颜色选择器实现：

```html
<!DOCTYPE html>
<html>
<head>
    <title>PDF.js 颜色选择器</title>
    <style>
        .color-picker-container {
            position: relative;
            display: inline-block;
        }
        
        .color-picker-trigger {
            width: 40px;
            height: 40px;
            border: 2px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            background: #FF0000;
            position: relative;
        }
        
        .color-picker-trigger::after {
            content: '';
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #666;
        }
        
        .color-picker-panel {
            position: absolute;
            top: 45px;
            left: 0;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 15px;
            min-width: 280px;
            z-index: 1000;
            display: none;
        }
        
        .color-picker-panel.show {
            display: block;
        }
        
        .color-section {
            margin-bottom: 15px;
        }
        
        .color-section h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #333;
        }
        
        .preset-colors {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 4px;
        }
        
        .preset-color {
            width: 28px;
            height: 28px;
            border: 1px solid #ddd;
            border-radius: 3px;
            cursor: pointer;
            transition: transform 0.1s;
        }
        
        .preset-color:hover {
            transform: scale(1.1);
            border-color: #007acc;
        }
        
        .preset-color.selected {
            border: 2px solid #007acc;
            transform: scale(1.1);
        }
        
        .color-input-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
        }
        
        .color-input {
            flex: 1;
            padding: 6px 8px;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-family: monospace;
        }
        
        .color-preview {
            width: 30px;
            height: 30px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        
        .color-sliders {
            margin-bottom: 15px;
        }
        
        .slider-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .slider-label {
            width: 20px;
            font-size: 12px;
            color: #666;
        }
        
        .color-slider {
            flex: 1;
            height: 20px;
            border-radius: 10px;
            outline: none;
            cursor: pointer;
        }
        
        .slider-value {
            width: 35px;
            font-size: 12px;
            text-align: center;
            color: #666;
        }
        
        .history-colors {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
        
        .history-color {
            width: 24px;
            height: 24px;
            border: 1px solid #ddd;
            border-radius: 3px;
            cursor: pointer;
            transition: transform 0.1s;
        }
        
        .history-color:hover {
            transform: scale(1.1);
            border-color: #007acc;
        }
        
        .color-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
        }
        
        .color-button {
            padding: 6px 12px;
            border: 1px solid #ccc;
            background: white;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .color-button.primary {
            background: #007acc;
            color: white;
            border-color: #007acc;
        }
        
        .color-button:hover {
            background: #f0f0f0;
        }
        
        .color-button.primary:hover {
            background: #005a9e;
        }
    </style>
</head>
<body>
    <div class="color-picker-container">
        <div id="colorTrigger" class="color-picker-trigger"></div>
        <div id="colorPanel" class="color-picker-panel">
            <!-- 预设颜色 -->
            <div class="color-section">
                <h4>预设颜色</h4>
                <div id="presetColors" class="preset-colors"></div>
            </div>
            
            <!-- 颜色输入 -->
            <div class="color-section">
                <h4>自定义颜色</h4>
                <div class="color-input-group">
                    <input type="text" id="hexInput" class="color-input" placeholder="#FF0000">
                    <div id="colorPreview" class="color-preview"></div>
                </div>
            </div>
            
            <!-- RGB滑块 -->
            <div class="color-sliders">
                <div class="slider-group">
                    <span class="slider-label">R</span>
                    <input type="range" id="redSlider" class="color-slider" min="0" max="255" value="255">
                    <span id="redValue" class="slider-value">255</span>
                </div>
                <div class="slider-group">
                    <span class="slider-label">G</span>
                    <input type="range" id="greenSlider" class="color-slider" min="0" max="255" value="0">
                    <span id="greenValue" class="slider-value">0</span>
                </div>
                <div class="slider-group">
                    <span class="slider-label">B</span>
                    <input type="range" id="blueSlider" class="color-slider" min="0" max="255" value="0">
                    <span id="blueValue" class="slider-value">0</span>
                </div>
            </div>
            
            <!-- 历史颜色 -->
            <div class="color-section">
                <h4>最近使用</h4>
                <div id="historyColors" class="history-colors"></div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="color-actions">
                <button id="clearHistory" class="color-button">清除历史</button>
                <div>
                    <button id="cancelBtn" class="color-button">取消</button>
                    <button id="confirmBtn" class="color-button primary">确定</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        /**
         * 颜色选择器类
         */
        class ColorPicker {
            constructor(options = {}) {
                this.container = options.container || document.body;
                this.currentColor = '#FF0000';
                this.callback = null;
                this.colorHistory = this.loadHistory();
                
                this.initializeElements();
                this.initializePresetColors();
                this.bindEvents();
                this.updateUI();
            }
            
            /**
             * 初始化DOM元素
             */
            initializeElements() {
                this.trigger = document.getElementById('colorTrigger');
                this.panel = document.getElementById('colorPanel');
                this.presetColors = document.getElementById('presetColors');
                this.hexInput = document.getElementById('hexInput');
                this.colorPreview = document.getElementById('colorPreview');
                this.redSlider = document.getElementById('redSlider');
                this.greenSlider = document.getElementById('greenSlider');
                this.blueSlider = document.getElementById('blueSlider');
                this.redValue = document.getElementById('redValue');
                this.greenValue = document.getElementById('greenValue');
                this.blueValue = document.getElementById('blueValue');
                this.historyColors = document.getElementById('historyColors');
                this.clearHistoryBtn = document.getElementById('clearHistory');
                this.cancelBtn = document.getElementById('cancelBtn');
                this.confirmBtn = document.getElementById('confirmBtn');
            }
            
            /**
             * 初始化预设颜色
             */
            initializePresetColors() {
                const presetColorValues = [
                    '#FF0000', '#FF8000', '#FFFF00', '#80FF00',
                    '#00FF00', '#00FF80', '#00FFFF', '#0080FF',
                    '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
                    '#800000', '#804000', '#808000', '#408000',
                    '#008000', '#008040', '#008080', '#004080',
                    '#000080', '#400080', '#800080', '#800040',
                    '#000000', '#404040', '#808080', '#C0C0C0',
                    '#FFFFFF', '#FFE0E0', '#E0FFE0', '#E0E0FF'
                ];
                
                presetColorValues.forEach(color => {
                    const colorDiv = document.createElement('div');
                    colorDiv.className = 'preset-color';
                    colorDiv.style.backgroundColor = color;
                    colorDiv.dataset.color = color;
                    colorDiv.title = color;
                    
                    colorDiv.addEventListener('click', () => {
                        this.setColor(color);
                        this.selectPresetColor(colorDiv);
                    });
                    
                    this.presetColors.appendChild(colorDiv);
                });
            }
            
            /**
             * 绑定事件监听器
             */
            bindEvents() {
                // 触发器点击事件
                this.trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle();
                });
                
                // 面板点击事件（阻止冒泡）
                this.panel.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
                
                // 文档点击事件（关闭面板）
                document.addEventListener('click', () => {
                    this.hide();
                });
                
                // HEX输入事件
                this.hexInput.addEventListener('input', (e) => {
                    const color = e.target.value;
                    if (this.isValidHexColor(color)) {
                        this.setColor(color);
                    }
                });
                
                // RGB滑块事件
                [this.redSlider, this.greenSlider, this.blueSlider].forEach(slider => {
                    slider.addEventListener('input', () => {
                        this.updateColorFromSliders();
                    });
                });
                
                // 按钮事件
                this.clearHistoryBtn.addEventListener('click', () => {
                    this.clearHistory();
                });
                
                this.cancelBtn.addEventListener('click', () => {
                    this.hide();
                });
                
                this.confirmBtn.addEventListener('click', () => {
                    this.confirm();
                });
            }
            
            /**
             * 显示颜色选择器
             */
            show(currentColor = '#FF0000', callback = null) {
                this.currentColor = currentColor;
                this.callback = callback;
                this.setColor(currentColor);
                this.panel.classList.add('show');
            }
            
            /**
             * 隐藏颜色选择器
             */
            hide() {
                this.panel.classList.remove('show');
            }
            
            /**
             * 切换显示状态
             */
            toggle() {
                if (this.panel.classList.contains('show')) {
                    this.hide();
                } else {
                    this.show(this.currentColor);
                }
            }
            
            /**
             * 设置颜色
             */
            setColor(color) {
                if (!this.isValidHexColor(color)) {
                    color = this.convertToHex(color);
                }
                
                this.currentColor = color;
                this.updateUI();
            }
            
            /**
             * 获取当前颜色
             */
            getColor() {
                return this.currentColor;
            }
            
            /**
             * 更新UI显示
             */
            updateUI() {
                // 更新触发器颜色
                this.trigger.style.backgroundColor = this.currentColor;
                
                // 更新预览
                this.colorPreview.style.backgroundColor = this.currentColor;
                
                // 更新HEX输入
                this.hexInput.value = this.currentColor;
                
                // 更新RGB滑块
                const rgb = this.hexToRgb(this.currentColor);
                if (rgb) {
                    this.redSlider.value = rgb.r;
                    this.greenSlider.value = rgb.g;
                    this.blueSlider.value = rgb.b;
                    this.redValue.textContent = rgb.r;
                    this.greenValue.textContent = rgb.g;
                    this.blueValue.textContent = rgb.b;
                }
                
                // 更新历史颜色
                this.updateHistoryColors();
            }
            
            /**
             * 从滑块更新颜色
             */
            updateColorFromSliders() {
                const r = parseInt(this.redSlider.value);
                const g = parseInt(this.greenSlider.value);
                const b = parseInt(this.blueSlider.value);
                
                const hex = this.rgbToHex(r, g, b);
                this.currentColor = hex;
                
                // 更新显示
                this.trigger.style.backgroundColor = hex;
                this.colorPreview.style.backgroundColor = hex;
                this.hexInput.value = hex;
                this.redValue.textContent = r;
                this.greenValue.textContent = g;
                this.blueValue.textContent = b;
            }
            
            /**
             * 选择预设颜色
             */
            selectPresetColor(selectedElement) {
                // 移除之前的选中状态
                this.presetColors.querySelectorAll('.preset-color').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // 添加选中状态
                selectedElement.classList.add('selected');
            }
            
            /**
             * 确认颜色选择
             */
            confirm() {
                this.addToHistory(this.currentColor);
                
                if (this.callback) {
                    this.callback(this.currentColor);
                }
                
                this.hide();
            }
            
            /**
             * 添加到历史记录
             */
            addToHistory(color) {
                // 移除重复颜色
                const index = this.colorHistory.indexOf(color);
                if (index > -1) {
                    this.colorHistory.splice(index, 1);
                }
                
                // 添加到开头
                this.colorHistory.unshift(color);
                
                // 限制历史记录数量
                if (this.colorHistory.length > 12) {
                    this.colorHistory = this.colorHistory.slice(0, 12);
                }
                
                this.saveHistory();
                this.updateHistoryColors();
            }
            
            /**
             * 更新历史颜色显示
             */
            updateHistoryColors() {
                this.historyColors.innerHTML = '';
                
                this.colorHistory.forEach(color => {
                    const colorDiv = document.createElement('div');
                    colorDiv.className = 'history-color';
                    colorDiv.style.backgroundColor = color;
                    colorDiv.title = color;
                    
                    colorDiv.addEventListener('click', () => {
                        this.setColor(color);
                    });
                    
                    this.historyColors.appendChild(colorDiv);
                });
            }
            
            /**
             * 清除历史记录
             */
            clearHistory() {
                this.colorHistory = [];
                this.saveHistory();
                this.updateHistoryColors();
            }
            
            /**
             * 保存历史记录到本地存储
             */
            saveHistory() {
                try {
                    localStorage.setItem('colorPickerHistory', JSON.stringify(this.colorHistory));
                } catch (e) {
                    console.warn('无法保存颜色历史记录:', e);
                }
            }
            
            /**
             * 从本地存储加载历史记录
             */
            loadHistory() {
                try {
                    const saved = localStorage.getItem('colorPickerHistory');
                    return saved ? JSON.parse(saved) : [];
                } catch (e) {
                    console.warn('无法加载颜色历史记录:', e);
                    return [];
                }
            }
            
            /**
             * 验证HEX颜色格式
             */
            isValidHexColor(color) {
                return /^#[0-9A-Fa-f]{6}$/.test(color);
            }
            
            /**
             * 转换颜色格式为HEX
             */
            convertToHex(color) {
                // 简单的颜色转换，实际应用中可能需要更复杂的转换
                if (color.startsWith('rgb')) {
                    const matches = color.match(/\d+/g);
                    if (matches && matches.length >= 3) {
                        return this.rgbToHex(
                            parseInt(matches[0]),
                            parseInt(matches[1]),
                            parseInt(matches[2])
                        );
                    }
                }
                return color;
            }
            
            /**
             * HEX转RGB
             */
            hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }
            
            /**
             * RGB转HEX
             */
            rgbToHex(r, g, b) {
                return '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('').toUpperCase();
            }
        }
        
        // 初始化颜色选择器
        const colorPicker = new ColorPicker();
        
        // 示例：使用颜色选择器
        document.getElementById('colorTrigger').addEventListener('click', () => {
            colorPicker.show('#FF0000', (selectedColor) => {
                console.log('选中的颜色:', selectedColor);
                // 这里可以应用颜色到编辑器或其他组件
            });
        });
    </script>
</body>
</html>
```

## 颜色格式支持

### HEX格式

```javascript
// 标准6位HEX
colorPicker.setColor('#FF0000'); // 红色
colorPicker.setColor('#00FF00'); // 绿色
colorPicker.setColor('#0000FF'); // 蓝色
```

### RGB格式

```javascript
// RGB字符串
colorPicker.setColor('rgb(255, 0, 0)');
colorPicker.setColor('rgb(0, 255, 0)');
colorPicker.setColor('rgb(0, 0, 255)');
```

### HSL格式

```javascript
// HSL字符串
colorPicker.setColor('hsl(0, 100%, 50%)');
colorPicker.setColor('hsl(120, 100%, 50%)');
colorPicker.setColor('hsl(240, 100%, 50%)');
```

## 事件处理

### 颜色变化事件

```javascript
colorPicker.on('colorchange', (event) => {
    const { color, source } = event.detail;
    console.log(`颜色变化: ${color}, 来源: ${source}`);
});
```

### 颜色确认事件

```javascript
colorPicker.on('colorconfirm', (event) => {
    const { color } = event.detail;
    console.log(`颜色确认: ${color}`);
    
    // 应用颜色到编辑器
    if (activeEditor) {
        activeEditor.setColor(color);
    }
});
```

## 高级功能

### 自定义预设颜色

```javascript
const customPresets = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

colorPicker.setPresetColors(customPresets);
```

### 颜色主题

```javascript
const themes = {
    material: {
        primary: '#2196F3',
        secondary: '#FF9800',
        success: '#4CAF50',
        warning: '#FF5722',
        error: '#F44336'
    },
    bootstrap: {
        primary: '#007BFF',
        secondary: '#6C757D',
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545'
    }
};

colorPicker.loadTheme(themes.material);
```

### 颜色验证

```javascript
class ColorValidator {
    static isValidColor(color) {
        // 创建临时元素测试颜色
        const div = document.createElement('div');
        div.style.color = color;
        return div.style.color !== '';
    }
    
    static normalizeColor(color) {
        const div = document.createElement('div');
        div.style.color = color;
        return div.style.color;
    }
    
    static getColorBrightness(color) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return 0;
        
        // 使用相对亮度公式
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    }
    
    static isLightColor(color) {
        return this.getColorBrightness(color) > 128;
    }
}
```

## 集成示例

### 与注释编辑器集成

```javascript
class AnnotationColorManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.colorPicker = new ColorPicker({
            container: document.getElementById('colorPickerContainer')
        });
        
        this.bindEvents();
    }
    
    bindEvents() {
        // 监听编辑器选择变化
        this.uiManager.eventBus.on('annotationeditorstateschanged', (evt) => {
            const activeEditor = this.uiManager.getActive();
            if (activeEditor) {
                this.showColorPicker(activeEditor);
            }
        });
    }
    
    showColorPicker(editor) {
        const currentColor = editor.getColor() || '#000000';
        
        this.colorPicker.show(currentColor, (selectedColor) => {
            editor.setColor(selectedColor);
            
            // 触发参数变化事件
            this.uiManager.eventBus.dispatch('annotationeditorparamschanged', {
                source: this.uiManager,
                details: {
                    type: 'color',
                    value: selectedColor
                }
            });
        });
    }
}
```

## 注意事项

1. **颜色格式**：确保颜色格式的一致性和有效性
2. **性能优化**：避免频繁的DOM操作和颜色转换
3. **用户体验**：提供直观的颜色预览和历史记录
4. **无障碍性**：支持键盘导航和屏幕阅读器
5. **移动端适配**：考虑触摸设备的特殊需求
6. **浏览器兼容性**：测试不同浏览器的颜色支持

## 相关链接

- [AnnotationEditorUIManager](/api/annotation-editor-ui-manager)
- [AnnotationEditorLayer](/api/annotation-editor-layer)
- [注释示例](/examples/annotations)
- [交互式表单](/examples/interactive-forms)
- [自定义查看器](/examples/custom-viewer)