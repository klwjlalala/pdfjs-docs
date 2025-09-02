# XfaLayer

`XfaLayer` 是 PDF.js 中用于渲染和管理 XFA (XML Forms Architecture) 表单的显示层组件。XFA 是 Adobe 开发的一种基于 XML 的表单技术，用于创建动态、交互式的 PDF 表单。

## 概述

XFA 表单与传统的 AcroForm 表单不同，它们使用 XML 定义表单结构和布局，支持更复杂的表单逻辑和动态内容。`XfaLayer` 负责将 XFA 表单渲染为可交互的 HTML 元素。

## 主要方法

### render(parameters)

渲染 XFA 表单层到指定的容器中。

**参数**:
- `parameters` (Object): 渲染参数对象
  - `viewport` (PageViewport): 页面视口对象
  - `div` (HTMLElement): XFA 层容器元素
  - `xfa` (Object): XFA 表单数据对象
  - `page` (PDFPageProxy, 可选): PDF 页面代理对象
  - `annotationStorage` (AnnotationStorage, 可选): 注释存储对象

**返回值**: `Promise<void>`

```javascript
import { XfaLayer } from 'pdfjs-dist/web/pdf_viewer'

// 获取页面和 XFA 数据
const page = await pdf.getPage(1)
const xfa = await page.getXfa()
const viewport = page.getViewport({ scale: 1.0 })

if (xfa) {
  // 创建 XFA 层容器
  const xfaDiv = document.createElement('div')
  xfaDiv.className = 'xfaLayer'
  container.appendChild(xfaDiv)
  
  // 渲染 XFA 层
  await XfaLayer.render({
    viewport,
    div: xfaDiv,
    xfa,
    page
  })
}
```

### update(parameters)

更新现有的 XFA 表单层。

**参数**:
- `parameters` (Object): 更新参数对象
  - `viewport` (PageViewport): 新的页面视口对象
  - `div` (HTMLElement): XFA 层容器元素

```javascript
// 更新 XFA 层（例如缩放变化时）
const newViewport = page.getViewport({ scale: 2.0 })

XfaLayer.update({
  viewport: newViewport,
  div: xfaDiv
})
```

## XFA 数据结构

XFA 数据通常包含以下结构：

```javascript
// XFA 数据对象示例
const xfaData = {
  template: {
    // XFA 模板定义
    subform: {
      name: 'form1',
      layout: 'tb',
      children: [
        {
          field: {
            name: 'TextField1',
            ui: {
              textEdit: {
                multiLine: false
              }
            },
            value: {
              text: '默认值'
            }
          }
        }
        // 更多字段...
      ]
    }
  },
  datasets: {
    // 数据集
    data: {
      // 表单数据
    }
  }
}
```

## 完整示例

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { XfaLayer } from 'pdfjs-dist/web/pdf_viewer'

/**
 * 渲染带 XFA 表单的 PDF 页面
 */
async function renderPageWithXfaLayer(pdf, pageNumber, container) {
  try {
    // 获取页面
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.0 })
    
    // 检查是否有 XFA 表单
    const xfa = await page.getXfa()
    
    if (xfa) {
      console.log('检测到 XFA 表单')
      
      // 创建 XFA 层容器
      const xfaDiv = document.createElement('div')
      xfaDiv.className = 'xfaLayer'
      xfaDiv.style.position = 'absolute'
      xfaDiv.style.left = '0'
      xfaDiv.style.top = '0'
      xfaDiv.style.width = viewport.width + 'px'
      xfaDiv.style.height = viewport.height + 'px'
      container.appendChild(xfaDiv)
      
      // 渲染 XFA 层
      await XfaLayer.render({
        viewport,
        div: xfaDiv,
        xfa,
        page
      })
      
      // 设置表单事件监听
      setupXfaEventListeners(xfaDiv)
      
    } else {
      console.log('此页面没有 XFA 表单')
      
      // 渲染常规页面内容
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      container.appendChild(canvas)
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      await page.render(renderContext).promise
    }
    
  } catch (error) {
    console.error('渲染 XFA 层失败:', error)
  }
}

/**
 * 设置 XFA 表单事件监听器
 */
function setupXfaEventListeners(xfaContainer) {
  // 监听输入字段变化
  xfaContainer.addEventListener('input', (event) => {
    if (event.target.matches('input, textarea, select')) {
      console.log('XFA 字段值变化:', {
        name: event.target.name,
        value: event.target.value
      })
      
      // 保存表单数据
      saveXfaFormData(event.target.name, event.target.value)
    }
  })
  
  // 监听按钮点击
  xfaContainer.addEventListener('click', (event) => {
    if (event.target.matches('button')) {
      console.log('XFA 按钮点击:', event.target.name)
      handleXfaButtonClick(event.target.name)
    }
  })
}

/**
 * 保存 XFA 表单数据
 */
function saveXfaFormData(fieldName, value) {
  // 实现表单数据保存逻辑
  const formData = JSON.parse(localStorage.getItem('xfaFormData') || '{}')
  formData[fieldName] = value
  localStorage.setItem('xfaFormData', JSON.stringify(formData))
}

/**
 * 处理 XFA 按钮点击
 */
function handleXfaButtonClick(buttonName) {
  switch (buttonName) {
    case 'submitButton':
      submitXfaForm()
      break
    case 'resetButton':
      resetXfaForm()
      break
    default:
      console.log('未知按钮:', buttonName)
  }
}
```

## XFA 表单验证

```javascript
/**
 * 验证 XFA 表单数据
 */
function validateXfaForm(xfaContainer) {
  const errors = []
  
  // 获取所有必填字段
  const requiredFields = xfaContainer.querySelectorAll('[required]')
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      errors.push({
        field: field.name,
        message: '此字段为必填项'
      })
      
      // 添加错误样式
      field.classList.add('error')
    } else {
      field.classList.remove('error')
    }
  })
  
  // 验证邮箱格式
  const emailFields = xfaContainer.querySelectorAll('input[type="email"]')
  emailFields.forEach(field => {
    if (field.value && !isValidEmail(field.value)) {
      errors.push({
        field: field.name,
        message: '邮箱格式不正确'
      })
      field.classList.add('error')
    }
  })
  
  return errors
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

## CSS 样式

XFA 层需要适当的 CSS 样式：

```css
.xfaLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  line-height: 1.2;
}

.xfaLayer .xfaPage {
  overflow: hidden;
  position: relative;
}

.xfaLayer .xfaContentarea {
  position: absolute;
}

.xfaLayer input,
.xfaLayer textarea,
.xfaLayer select {
  background-image: none;
  border: 1px solid transparent;
  border-radius: 0;
  color: inherit;
  font: inherit;
  text-align: inherit;
}

.xfaLayer input:hover,
.xfaLayer textarea:hover,
.xfaLayer select:hover {
  border: 1px solid black;
}

.xfaLayer input:focus,
.xfaLayer textarea:focus,
.xfaLayer select:focus {
  border: 1px solid blue;
  outline: none;
}

.xfaLayer input.error,
.xfaLayer textarea.error,
.xfaLayer select.error {
  border: 1px solid red;
  background-color: #ffe6e6;
}

.xfaLayer button {
  border: 1px solid #ccc;
  background: #f0f0f0;
  cursor: pointer;
  padding: 4px 8px;
}

.xfaLayer button:hover {
  background: #e0e0e0;
}

.xfaLayer button:active {
  background: #d0d0d0;
}
```

## 注意事项

1. **XFA 支持检测**: 并非所有 PDF 都包含 XFA 表单，需要先检测是否存在。

2. **浏览器兼容性**: XFA 表单的复杂功能可能在某些浏览器中表现不一致。

3. **性能考虑**: 复杂的 XFA 表单可能影响渲染性能。

4. **数据持久化**: 考虑如何保存和恢复用户输入的表单数据。

5. **安全性**: 处理用户输入时要注意 XSS 等安全问题。

## 与 AcroForm 的区别

| 特性 | XFA 表单 | AcroForm 表单 |
|------|----------|---------------|
| 技术基础 | XML | PDF 对象 |
| 布局能力 | 动态布局 | 固定布局 |
| 复杂度 | 高 | 中等 |
| 浏览器支持 | 有限 | 较好 |
| 文件大小 | 较大 | 较小 |

## 相关链接

- [AnnotationLayer API](/api/annotation-layer)
- [PDFPageProxy API](/api/pdf-page-proxy)
- [表单填写示例](/examples/forms)
- [高级功能示例](/examples/advanced-features)