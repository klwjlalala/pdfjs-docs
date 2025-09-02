# 交互式表单处理

本指南展示如何使用 PDF.js 处理 PDF 中的交互式表单，包括表单字段的读取、填写、验证和提交。

## 基础概念

PDF 表单主要有两种类型：
- **AcroForm**: 传统的 PDF 表单格式
- **XFA (XML Forms Architecture)**: 基于 XML 的动态表单格式

PDF.js 支持这两种格式的表单处理。

## 基本表单处理

### 获取表单字段

```javascript
import * as pdfjsLib from 'pdfjs-dist'

/**
 * 获取PDF中的所有表单字段
 */
async function getFormFields(pdfUrl) {
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise
    const formFields = []
    
    // 遍历所有页面
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const annotations = await page.getAnnotations()
      
      // 筛选表单字段注释
      const pageFields = annotations.filter(annotation => 
        annotation.subtype === 'Widget' && annotation.fieldName
      )
      
      formFields.push(...pageFields.map(field => ({
        ...field,
        pageNumber: pageNum
      })))
    }
    
    return formFields
  } catch (error) {
    console.error('获取表单字段失败:', error)
    throw error
  }
}

// 使用示例
getFormFields('/path/to/form.pdf')
  .then(fields => {
    console.log('表单字段:', fields)
    fields.forEach(field => {
      console.log(`字段名: ${field.fieldName}, 类型: ${field.fieldType}, 页面: ${field.pageNumber}`)
    })
  })
```

### 读取表单数据

```javascript
/**
 * 读取表单的当前值
 */
async function readFormData(pdfUrl) {
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise
    const formData = {}
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const annotations = await page.getAnnotations()
      
      annotations.forEach(annotation => {
        if (annotation.subtype === 'Widget' && annotation.fieldName) {
          const fieldName = annotation.fieldName
          const fieldValue = annotation.fieldValue || annotation.buttonValue || ''
          
          formData[fieldName] = {
            value: fieldValue,
            type: annotation.fieldType,
            required: annotation.required || false,
            readOnly: annotation.readOnly || false,
            pageNumber: pageNum,
            rect: annotation.rect
          }
        }
      })
    }
    
    return formData
  } catch (error) {
    console.error('读取表单数据失败:', error)
    throw error
  }
}

// 使用示例
readFormData('/path/to/filled-form.pdf')
  .then(data => {
    console.log('表单数据:', data)
    Object.entries(data).forEach(([fieldName, fieldInfo]) => {
      console.log(`${fieldName}: ${fieldInfo.value} (${fieldInfo.type})`)
    })
  })
```

## 完整的表单处理器

```javascript
import * as pdfjsLib from 'pdfjs-dist'

/**
 * PDF表单处理器
 */
class PDFFormHandler {
  constructor(container) {
    this.container = container
    this.pdf = null
    this.formFields = new Map()
    this.formData = new Map()
    this.currentPage = 1
    
    this.setupEventListeners()
  }
  
  /**
   * 加载PDF表单
   */
  async loadForm(pdfUrl) {
    try {
      this.pdf = await pdfjsLib.getDocument(pdfUrl).promise
      await this.extractFormFields()
      await this.renderCurrentPage()
      this.createFormUI()
    } catch (error) {
      console.error('加载表单失败:', error)
      throw error
    }
  }
  
  /**
   * 提取表单字段
   */
  async extractFormFields() {
    this.formFields.clear()
    
    for (let pageNum = 1; pageNum <= this.pdf.numPages; pageNum++) {
      const page = await this.pdf.getPage(pageNum)
      const annotations = await page.getAnnotations()
      
      annotations.forEach(annotation => {
        if (annotation.subtype === 'Widget' && annotation.fieldName) {
          const fieldInfo = {
            ...annotation,
            pageNumber: pageNum,
            element: null // 将存储对应的DOM元素
          }
          
          this.formFields.set(annotation.fieldName, fieldInfo)
          
          // 初始化表单数据
          this.formData.set(annotation.fieldName, 
            annotation.fieldValue || annotation.buttonValue || ''
          )
        }
      })
    }
    
    console.log(`提取到 ${this.formFields.size} 个表单字段`)
  }
  
  /**
   * 渲染当前页面
   */
  async renderCurrentPage() {
    const page = await this.pdf.getPage(this.currentPage)
    const viewport = page.getViewport({ scale: 1.0 })
    
    // 清空容器
    this.container.innerHTML = ''
    
    // 创建页面容器
    const pageDiv = document.createElement('div')
    pageDiv.className = 'pdf-page'
    pageDiv.style.position = 'relative'
    pageDiv.style.width = viewport.width + 'px'
    pageDiv.style.height = viewport.height + 'px'
    this.container.appendChild(pageDiv)
    
    // 渲染PDF内容
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
    
    // 渲染表单字段
    await this.renderFormFields(pageDiv, viewport)
  }
  
  /**
   * 渲染表单字段
   */
  async renderFormFields(pageDiv, viewport) {
    const currentPageFields = Array.from(this.formFields.values())
      .filter(field => field.pageNumber === this.currentPage)
    
    for (const field of currentPageFields) {
      const element = this.createFormElement(field, viewport)
      if (element) {
        pageDiv.appendChild(element)
        field.element = element
      }
    }
  }
  
  /**
   * 创建表单元素
   */
  createFormElement(field, viewport) {
    const rect = viewport.convertToViewportRectangle(field.rect)
    const [x1, y1, x2, y2] = rect
    
    let element = null
    
    switch (field.fieldType) {
      case 'Tx': // 文本字段
        element = this.createTextInput(field)
        break
        
      case 'Ch': // 选择字段 (下拉框或列表)
        element = this.createChoiceInput(field)
        break
        
      case 'Btn': // 按钮字段 (复选框、单选框、按钮)
        element = this.createButtonInput(field)
        break
        
      default:
        console.warn('不支持的字段类型:', field.fieldType)
        return null
    }
    
    if (element) {
      // 设置位置和大小
      element.style.position = 'absolute'
      element.style.left = Math.min(x1, x2) + 'px'
      element.style.top = Math.min(y1, y2) + 'px'
      element.style.width = Math.abs(x2 - x1) + 'px'
      element.style.height = Math.abs(y2 - y1) + 'px'
      
      // 设置通用属性
      element.name = field.fieldName
      element.disabled = field.readOnly
      
      // 绑定事件
      this.bindFieldEvents(element, field)
    }
    
    return element
  }
  
  /**
   * 创建文本输入框
   */
  createTextInput(field) {
    const input = field.multiLine ? 
      document.createElement('textarea') : 
      document.createElement('input')
    
    if (!field.multiLine) {
      input.type = field.password ? 'password' : 'text'
    }
    
    input.value = this.formData.get(field.fieldName) || ''
    input.placeholder = field.alternativeText || ''
    
    if (field.maxLen) {
      input.maxLength = field.maxLen
    }
    
    return input
  }
  
  /**
   * 创建选择输入框
   */
  createChoiceInput(field) {
    const select = document.createElement('select')
    
    if (field.multiSelect) {
      select.multiple = true
    }
    
    // 添加选项
    if (field.options) {
      field.options.forEach(option => {
        const optionElement = document.createElement('option')
        optionElement.value = option.exportValue || option.displayValue
        optionElement.textContent = option.displayValue
        
        // 设置选中状态
        const currentValue = this.formData.get(field.fieldName)
        if (currentValue === optionElement.value) {
          optionElement.selected = true
        }
        
        select.appendChild(optionElement)
      })
    }
    
    return select
  }
  
  /**
   * 创建按钮输入框
   */
  createButtonInput(field) {
    let element = null
    
    if (field.checkBox) {
      element = document.createElement('input')
      element.type = 'checkbox'
      element.checked = this.formData.get(field.fieldName) === 'Yes'
    } else if (field.radioButton) {
      element = document.createElement('input')
      element.type = 'radio'
      element.value = field.buttonValue || 'Yes'
      element.checked = this.formData.get(field.fieldName) === element.value
    } else {
      element = document.createElement('button')
      element.textContent = field.alternativeText || '按钮'
      element.type = 'button'
    }
    
    return element
  }
  
  /**
   * 绑定字段事件
   */
  bindFieldEvents(element, field) {
    const updateValue = () => {
      let value = ''
      
      if (element.type === 'checkbox') {
        value = element.checked ? 'Yes' : 'Off'
      } else if (element.type === 'radio') {
        value = element.checked ? element.value : ''
      } else {
        value = element.value
      }
      
      this.formData.set(field.fieldName, value)
      this.onFieldChange(field.fieldName, value, field)
    }
    
    // 绑定适当的事件
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.addEventListener('change', updateValue)
    } else if (element.tagName === 'SELECT') {
      element.addEventListener('change', updateValue)
    } else if (element.tagName === 'BUTTON') {
      element.addEventListener('click', () => {
        this.onButtonClick(field.fieldName, field)
      })
    } else {
      element.addEventListener('input', updateValue)
      element.addEventListener('blur', updateValue)
    }
  }
  
  /**
   * 字段值变化回调
   */
  onFieldChange(fieldName, value, field) {
    console.log(`字段 ${fieldName} 值变为: ${value}`)
    
    // 执行字段验证
    this.validateField(fieldName, value, field)
    
    // 触发自定义事件
    this.container.dispatchEvent(new CustomEvent('fieldchange', {
      detail: { fieldName, value, field }
    }))
  }
  
  /**
   * 按钮点击回调
   */
  onButtonClick(fieldName, field) {
    console.log(`按钮 ${fieldName} 被点击`)
    
    // 处理特殊按钮动作
    if (field.actions) {
      this.executeActions(field.actions)
    }
    
    // 触发自定义事件
    this.container.dispatchEvent(new CustomEvent('buttonclick', {
      detail: { fieldName, field }
    }))
  }
  
  /**
   * 验证字段
   */
  validateField(fieldName, value, field) {
    const errors = []
    
    // 必填验证
    if (field.required && (!value || value.trim() === '')) {
      errors.push('此字段为必填项')
    }
    
    // 长度验证
    if (field.maxLen && value.length > field.maxLen) {
      errors.push(`字段长度不能超过 ${field.maxLen} 个字符`)
    }
    
    // 格式验证 (如果有正则表达式)
    if (field.format && field.format.regex) {
      const regex = new RegExp(field.format.regex)
      if (!regex.test(value)) {
        errors.push('字段格式不正确')
      }
    }
    
    // 显示验证结果
    this.showFieldValidation(fieldName, errors)
    
    return errors.length === 0
  }
  
  /**
   * 显示字段验证结果
   */
  showFieldValidation(fieldName, errors) {
    const field = this.formFields.get(fieldName)
    if (!field || !field.element) return
    
    // 移除之前的错误提示
    const existingError = field.element.parentNode.querySelector('.field-error')
    if (existingError) {
      existingError.remove()
    }
    
    // 更新字段样式
    if (errors.length > 0) {
      field.element.classList.add('field-invalid')
      
      // 添加错误提示
      const errorDiv = document.createElement('div')
      errorDiv.className = 'field-error'
      errorDiv.textContent = errors[0] // 显示第一个错误
      field.element.parentNode.appendChild(errorDiv)
    } else {
      field.element.classList.remove('field-invalid')
    }
  }
  
  /**
   * 创建表单UI控制面板
   */
  createFormUI() {
    const controlPanel = document.createElement('div')
    controlPanel.className = 'form-controls'
    controlPanel.innerHTML = `
      <div class="form-toolbar">
        <button id="validate-form">验证表单</button>
        <button id="reset-form">重置表单</button>
        <button id="export-data">导出数据</button>
        <button id="import-data">导入数据</button>
        <input type="file" id="import-file" accept=".json" style="display: none;">
      </div>
      <div class="page-navigation">
        <button id="prev-page" ${this.currentPage <= 1 ? 'disabled' : ''}>上一页</button>
        <span>第 ${this.currentPage} 页，共 ${this.pdf.numPages} 页</span>
        <button id="next-page" ${this.currentPage >= this.pdf.numPages ? 'disabled' : ''}>下一页</button>
      </div>
    `
    
    this.container.insertBefore(controlPanel, this.container.firstChild)
    
    // 绑定控制面板事件
    this.bindControlEvents(controlPanel)
  }
  
  /**
   * 绑定控制面板事件
   */
  bindControlEvents(controlPanel) {
    // 验证表单
    controlPanel.querySelector('#validate-form').addEventListener('click', () => {
      this.validateForm()
    })
    
    // 重置表单
    controlPanel.querySelector('#reset-form').addEventListener('click', () => {
      this.resetForm()
    })
    
    // 导出数据
    controlPanel.querySelector('#export-data').addEventListener('click', () => {
      this.exportFormData()
    })
    
    // 导入数据
    controlPanel.querySelector('#import-data').addEventListener('click', () => {
      controlPanel.querySelector('#import-file').click()
    })
    
    controlPanel.querySelector('#import-file').addEventListener('change', (e) => {
      this.importFormData(e.target.files[0])
    })
    
    // 页面导航
    controlPanel.querySelector('#prev-page').addEventListener('click', () => {
      this.goToPage(this.currentPage - 1)
    })
    
    controlPanel.querySelector('#next-page').addEventListener('click', () => {
      this.goToPage(this.currentPage + 1)
    })
  }
  
  /**
   * 验证整个表单
   */
  validateForm() {
    let isValid = true
    const errors = []
    
    this.formFields.forEach((field, fieldName) => {
      const value = this.formData.get(fieldName) || ''
      const fieldValid = this.validateField(fieldName, value, field)
      
      if (!fieldValid) {
        isValid = false
        errors.push(`字段 "${fieldName}" 验证失败`)
      }
    })
    
    // 显示验证结果
    if (isValid) {
      alert('表单验证通过！')
    } else {
      alert('表单验证失败：\n' + errors.join('\n'))
    }
    
    return isValid
  }
  
  /**
   * 重置表单
   */
  resetForm() {
    if (confirm('确定要重置表单吗？所有数据将被清除。')) {
      this.formData.clear()
      this.formFields.forEach((field, fieldName) => {
        this.formData.set(fieldName, '')
        if (field.element) {
          if (field.element.type === 'checkbox' || field.element.type === 'radio') {
            field.element.checked = false
          } else {
            field.element.value = ''
          }
        }
      })
      
      // 重新渲染当前页面
      this.renderCurrentPage()
    }
  }
  
  /**
   * 导出表单数据
   */
  exportFormData() {
    const data = {
      formData: Object.fromEntries(this.formData),
      metadata: {
        exportDate: new Date().toISOString(),
        totalFields: this.formFields.size,
        pdfPages: this.pdf.numPages
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'form-data.json'
    a.click()
    
    URL.revokeObjectURL(url)
  }
  
  /**
   * 导入表单数据
   */
  async importFormData(file) {
    if (!file) return
    
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (data.formData) {
        // 导入数据
        Object.entries(data.formData).forEach(([fieldName, value]) => {
          if (this.formFields.has(fieldName)) {
            this.formData.set(fieldName, value)
            
            const field = this.formFields.get(fieldName)
            if (field.element) {
              if (field.element.type === 'checkbox') {
                field.element.checked = value === 'Yes'
              } else if (field.element.type === 'radio') {
                field.element.checked = value === field.element.value
              } else {
                field.element.value = value
              }
            }
          }
        })
        
        alert('数据导入成功！')
      }
    } catch (error) {
      console.error('导入数据失败:', error)
      alert('导入数据失败: ' + error.message)
    }
  }
  
  /**
   * 跳转到指定页面
   */
  async goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > this.pdf.numPages) return
    
    this.currentPage = pageNumber
    await this.renderCurrentPage()
    
    // 更新导航按钮状态
    const controlPanel = this.container.querySelector('.form-controls')
    const prevBtn = controlPanel.querySelector('#prev-page')
    const nextBtn = controlPanel.querySelector('#next-page')
    const pageInfo = controlPanel.querySelector('.page-navigation span')
    
    prevBtn.disabled = this.currentPage <= 1
    nextBtn.disabled = this.currentPage >= this.pdf.numPages
    pageInfo.textContent = `第 ${this.currentPage} 页，共 ${this.pdf.numPages} 页`
  }
  
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听表单字段变化
    this.container.addEventListener('fieldchange', (e) => {
      console.log('表单字段变化:', e.detail)
    })
    
    // 监听按钮点击
    this.container.addEventListener('buttonclick', (e) => {
      console.log('按钮点击:', e.detail)
    })
  }
  
  /**
   * 获取表单数据
   */
  getFormData() {
    return Object.fromEntries(this.formData)
  }
  
  /**
   * 设置表单数据
   */
  setFormData(data) {
    Object.entries(data).forEach(([fieldName, value]) => {
      if (this.formFields.has(fieldName)) {
        this.formData.set(fieldName, value)
      }
    })
    
    // 重新渲染当前页面以反映数据变化
    this.renderCurrentPage()
  }
}

// 使用示例
const container = document.getElementById('pdf-form-container')
const formHandler = new PDFFormHandler(container)

formHandler.loadForm('/path/to/interactive-form.pdf')
  .then(() => {
    console.log('表单加载完成')
    
    // 监听表单事件
    container.addEventListener('fieldchange', (e) => {
      console.log(`字段 ${e.detail.fieldName} 的值变为: ${e.detail.value}`)
    })
  })
  .catch(error => {
    console.error('加载表单失败:', error)
  })
```

## CSS 样式

```css
.pdf-page {
  border: 1px solid #ccc;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-controls {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.form-toolbar button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.form-toolbar button:hover {
  background: #f0f0f0;
}

.page-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-navigation button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.page-navigation button:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

/* 表单字段样式 */
input, textarea, select {
  border: 1px solid #ddd;
  padding: 4px 8px;
  font-size: 12px;
  font-family: inherit;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.field-invalid {
  border-color: #f44336 !important;
  background-color: #ffebee;
}

.field-error {
  position: absolute;
  top: 100%;
  left: 0;
  background: #f44336;
  color: white;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  margin-top: 2px;
}

.field-error::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 8px;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #f44336;
}

/* 按钮样式 */
button[type="button"] {
  background: #007acc;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

button[type="button"]:hover {
  background: #005a9e;
}

/* 复选框和单选框样式 */
input[type="checkbox"], input[type="radio"] {
  width: auto !important;
  height: auto !important;
  margin: 0;
}
```

## 高级功能

### 表单验证规则

```javascript
/**
 * 高级表单验证器
 */
class FormValidator {
  constructor() {
    this.rules = new Map()
  }
  
  /**
   * 添加验证规则
   */
  addRule(fieldName, rule) {
    if (!this.rules.has(fieldName)) {
      this.rules.set(fieldName, [])
    }
    this.rules.get(fieldName).push(rule)
  }
  
  /**
   * 验证字段
   */
  validateField(fieldName, value) {
    const fieldRules = this.rules.get(fieldName) || []
    const errors = []
    
    for (const rule of fieldRules) {
      const result = rule.validate(value)
      if (!result.valid) {
        errors.push(result.message)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// 预定义验证规则
const ValidationRules = {
  required: {
    validate: (value) => ({
      valid: value && value.trim() !== '',
      message: '此字段为必填项'
    })
  },
  
  email: {
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return {
        valid: !value || emailRegex.test(value),
        message: '请输入有效的邮箱地址'
      }
    }
  },
  
  phone: {
    validate: (value) => {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/
      return {
        valid: !value || phoneRegex.test(value),
        message: '请输入有效的电话号码'
      }
    }
  },
  
  minLength: (min) => ({
    validate: (value) => ({
      valid: !value || value.length >= min,
      message: `最少需要 ${min} 个字符`
    })
  }),
  
  maxLength: (max) => ({
    validate: (value) => ({
      valid: !value || value.length <= max,
      message: `最多允许 ${max} 个字符`
    })
  })
}

// 使用示例
const validator = new FormValidator()
validator.addRule('email', ValidationRules.required)
validator.addRule('email', ValidationRules.email)
validator.addRule('name', ValidationRules.required)
validator.addRule('name', ValidationRules.minLength(2))
```

### 表单数据持久化

```javascript
/**
 * 表单数据持久化管理器
 */
class FormDataPersistence {
  constructor(formId) {
    this.formId = formId
    this.storageKey = `pdf_form_${formId}`
  }
  
  /**
   * 保存表单数据到本地存储
   */
  saveToLocalStorage(formData) {
    try {
      const data = {
        formData,
        timestamp: Date.now(),
        version: '1.0'
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('保存到本地存储失败:', error)
      return false
    }
  }
  
  /**
   * 从本地存储加载表单数据
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        return data.formData
      }
    } catch (error) {
      console.error('从本地存储加载失败:', error)
    }
    return null
  }
  
  /**
   * 清除本地存储的数据
   */
  clearLocalStorage() {
    localStorage.removeItem(this.storageKey)
  }
  
  /**
   * 自动保存功能
   */
  enableAutoSave(formHandler, interval = 30000) {
    return setInterval(() => {
      const formData = formHandler.getFormData()
      this.saveToLocalStorage(formData)
      console.log('表单数据已自动保存')
    }, interval)
  }
}
```

## 注意事项

1. **浏览器兼容性**: 某些高级表单功能可能在旧版浏览器中不完全支持。

2. **性能考虑**: 大型表单可能影响渲染性能，考虑分页或虚拟化。

3. **数据安全**: 敏感表单数据应该加密存储和传输。

4. **可访问性**: 确保表单支持键盘导航和屏幕阅读器。

5. **移动端适配**: 在移动设备上可能需要特殊的触摸处理。

## 相关链接

- [注释处理](/examples/annotations)
- [文本提取](/examples/text-extraction)
- [PDF文档API](/api/pdf-document-proxy)
- [错误处理指南](/guide/error-handling)