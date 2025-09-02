# PasswordResponses

`PasswordResponses` 是 PDF.js 中用于处理密码保护 PDF 文档的枚举常量。当 PDF 文档需要密码验证时，系统会返回相应的响应代码来指示密码验证的结果。

## 概述

密码响应枚举定义了 PDF 文档密码验证过程中可能出现的各种状态。这些常量帮助开发者正确处理密码验证流程，提供适当的用户反馈。

## 枚举值

### NEED_PASSWORD

表示 PDF 文档需要密码才能打开。

**值**: `1`

```javascript
import { PasswordResponses } from 'pdfjs-dist'

if (error.name === 'PasswordException' && error.code === PasswordResponses.NEED_PASSWORD) {
  console.log('文档需要密码')
  // 显示密码输入对话框
  showPasswordDialog()
}
```

### INCORRECT_PASSWORD

表示提供的密码不正确。

**值**: `2`

```javascript
import { PasswordResponses } from 'pdfjs-dist'

if (error.name === 'PasswordException' && error.code === PasswordResponses.INCORRECT_PASSWORD) {
  console.log('密码错误')
  // 显示错误提示并重新请求密码
  showPasswordError('密码错误，请重新输入')
}
```

## 使用示例

### 基本密码处理

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { PasswordResponses } from 'pdfjs-dist'

/**
 * 加载受密码保护的PDF文档
 */
async function loadProtectedPDF(url) {
  let password = null
  
  while (true) {
    try {
      const loadingTask = pdfjsLib.getDocument({
        url: url,
        password: password
      })
      
      const pdf = await loadingTask.promise
      console.log('PDF加载成功')
      return pdf
      
    } catch (error) {
      if (error.name === 'PasswordException') {
        switch (error.code) {
          case PasswordResponses.NEED_PASSWORD:
            console.log('需要密码')
            password = await promptForPassword('请输入PDF密码：')
            break
            
          case PasswordResponses.INCORRECT_PASSWORD:
            console.log('密码错误')
            password = await promptForPassword('密码错误，请重新输入：')
            break
            
          default:
            console.error('未知的密码错误:', error)
            throw error
        }
      } else {
        console.error('加载PDF失败:', error)
        throw error
      }
    }
  }
}

/**
 * 提示用户输入密码
 */
function promptForPassword(message) {
  return new Promise((resolve) => {
    const password = prompt(message)
    resolve(password)
  })
}

// 使用示例
loadProtectedPDF('/path/to/protected.pdf')
  .then(pdf => {
    console.log('PDF文档加载完成，页数:', pdf.numPages)
  })
  .catch(error => {
    console.error('无法加载PDF:', error)
  })
```

### 带UI的密码处理

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { PasswordResponses } from 'pdfjs-dist'

/**
 * PDF密码管理器
 */
class PDFPasswordManager {
  constructor() {
    this.maxAttempts = 3
    this.currentAttempts = 0
  }
  
  /**
   * 加载受保护的PDF
   */
  async loadPDF(url, container) {
    this.currentAttempts = 0
    
    try {
      const pdf = await this.loadWithPasswordHandling(url)
      await this.renderPDF(pdf, container)
      return pdf
    } catch (error) {
      this.showError('无法加载PDF文档: ' + error.message)
      throw error
    }
  }
  
  /**
   * 处理密码验证的PDF加载
   */
  async loadWithPasswordHandling(url, password = null) {
    try {
      const loadingTask = pdfjsLib.getDocument({
        url: url,
        password: password
      })
      
      return await loadingTask.promise
      
    } catch (error) {
      if (error.name === 'PasswordException') {
        return await this.handlePasswordError(error, url)
      }
      throw error
    }
  }
  
  /**
   * 处理密码错误
   */
  async handlePasswordError(error, url) {
    this.currentAttempts++
    
    if (this.currentAttempts > this.maxAttempts) {
      throw new Error('密码尝试次数过多，请稍后再试')
    }
    
    let message = ''
    
    switch (error.code) {
      case PasswordResponses.NEED_PASSWORD:
        message = '此PDF文档受密码保护，请输入密码：'
        break
        
      case PasswordResponses.INCORRECT_PASSWORD:
        message = `密码错误，请重新输入 (剩余尝试次数: ${this.maxAttempts - this.currentAttempts})：`
        break
        
      default:
        throw new Error('未知的密码验证错误')
    }
    
    const password = await this.showPasswordDialog(message)
    
    if (!password) {
      throw new Error('用户取消了密码输入')
    }
    
    return await this.loadWithPasswordHandling(url, password)
  }
  
  /**
   * 显示密码输入对话框
   */
  showPasswordDialog(message) {
    return new Promise((resolve) => {
      // 创建模态对话框
      const dialog = document.createElement('div')
      dialog.className = 'password-dialog'
      dialog.innerHTML = `
        <div class="dialog-content">
          <h3>PDF密码验证</h3>
          <p>${message}</p>
          <input type="password" id="pdf-password" placeholder="请输入密码">
          <div class="dialog-buttons">
            <button id="confirm-btn">确认</button>
            <button id="cancel-btn">取消</button>
          </div>
        </div>
      `
      
      document.body.appendChild(dialog)
      
      const passwordInput = dialog.querySelector('#pdf-password')
      const confirmBtn = dialog.querySelector('#confirm-btn')
      const cancelBtn = dialog.querySelector('#cancel-btn')
      
      // 聚焦到密码输入框
      passwordInput.focus()
      
      // 确认按钮事件
      confirmBtn.addEventListener('click', () => {
        const password = passwordInput.value
        document.body.removeChild(dialog)
        resolve(password)
      })
      
      // 取消按钮事件
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(dialog)
        resolve(null)
      })
      
      // 回车键确认
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          confirmBtn.click()
        }
      })
      
      // ESC键取消
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          cancelBtn.click()
        }
      })
    })
  }
  
  /**
   * 渲染PDF到容器
   */
  async renderPDF(pdf, container) {
    // 清空容器
    container.innerHTML = ''
    
    // 渲染第一页作为示例
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.0 })
    
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
    console.log('PDF渲染完成')
  }
  
  /**
   * 显示错误信息
   */
  showError(message) {
    const errorDiv = document.createElement('div')
    errorDiv.className = 'error-message'
    errorDiv.textContent = message
    document.body.appendChild(errorDiv)
    
    // 3秒后自动移除
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv)
      }
    }, 3000)
  }
}

// 使用示例
const passwordManager = new PDFPasswordManager()
const container = document.getElementById('pdf-container')

passwordManager.loadPDF('/path/to/protected.pdf', container)
  .then(pdf => {
    console.log('PDF加载成功，页数:', pdf.numPages)
  })
  .catch(error => {
    console.error('加载失败:', error)
  })
```

### React组件示例

```javascript
import React, { useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PasswordResponses } from 'pdfjs-dist'

/**
 * PDF密码输入组件
 */
const PDFPasswordViewer = ({ pdfUrl }) => {
  const [pdf, setPdf] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [needPassword, setNeedPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [attempts, setAttempts] = useState(0)
  
  /**
   * 加载PDF文档
   */
  const loadPDF = useCallback(async (inputPassword = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        password: inputPassword
      })
      
      const pdfDoc = await loadingTask.promise
      setPdf(pdfDoc)
      setNeedPassword(false)
      setAttempts(0)
      
    } catch (err) {
      if (err.name === 'PasswordException') {
        handlePasswordError(err)
      } else {
        setError('加载PDF失败: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [pdfUrl])
  
  /**
   * 处理密码错误
   */
  const handlePasswordError = (err) => {
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    
    if (newAttempts > 3) {
      setError('密码尝试次数过多，请稍后再试')
      return
    }
    
    switch (err.code) {
      case PasswordResponses.NEED_PASSWORD:
        setNeedPassword(true)
        setError(null)
        break
        
      case PasswordResponses.INCORRECT_PASSWORD:
        setNeedPassword(true)
        setError(`密码错误，剩余尝试次数: ${3 - newAttempts}`)
        break
        
      default:
        setError('未知的密码验证错误')
    }
  }
  
  /**
   * 提交密码
   */
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password.trim()) {
      loadPDF(password)
    }
  }
  
  // 初始加载
  React.useEffect(() => {
    if (pdfUrl) {
      loadPDF()
    }
  }, [pdfUrl, loadPDF])
  
  if (loading) {
    return <div className="loading">加载中...</div>
  }
  
  if (needPassword) {
    return (
      <div className="password-form">
        <h3>PDF密码验证</h3>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入PDF密码"
            autoFocus
          />
          <button type="submit" disabled={!password.trim()}>
            确认
          </button>
        </form>
        <p>尝试次数: {attempts}/3</p>
      </div>
    )
  }
  
  if (error) {
    return <div className="error">{error}</div>
  }
  
  if (pdf) {
    return (
      <div className="pdf-viewer">
        <h3>PDF加载成功</h3>
        <p>页数: {pdf.numPages}</p>
        {/* 这里可以添加PDF渲染逻辑 */}
      </div>
    )
  }
  
  return <div>请选择PDF文件</div>
}

export default PDFPasswordViewer
```

## CSS 样式

```css
.password-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  max-width: 400px;
}

.dialog-content h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.dialog-content p {
  margin: 0 0 16px 0;
  color: #666;
}

.dialog-content input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
}

.dialog-content input:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.dialog-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.dialog-buttons button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.dialog-buttons button:first-child {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

.dialog-buttons button:first-child:hover {
  background: #005a9e;
}

.dialog-buttons button:last-child {
  background: #f5f5f5;
}

.dialog-buttons button:last-child:hover {
  background: #e0e0e0;
}

.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #f44336;
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1001;
}

.password-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.password-form h3 {
  margin: 0 0 16px 0;
  text-align: center;
}

.password-form .error {
  color: #f44336;
  margin-bottom: 16px;
  padding: 8px;
  background: #ffebee;
  border-radius: 4px;
}

.password-form form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.password-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.password-form button {
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.password-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 24px;
  color: #666;
}
```

## 最佳实践

1. **用户体验**: 提供清晰的密码提示和错误信息。

2. **安全性**: 不要在客户端存储或记录密码。

3. **重试限制**: 限制密码尝试次数，防止暴力破解。

4. **错误处理**: 优雅地处理各种密码验证场景。

5. **可访问性**: 确保密码输入界面支持键盘导航和屏幕阅读器。

## 注意事项

1. **密码类型**: PDF可能有用户密码和所有者密码两种类型。

2. **权限限制**: 即使提供了正确密码，某些操作可能仍然受限。

3. **浏览器兼容性**: 密码处理在不同浏览器中的表现可能略有差异。

4. **内存管理**: 及时清理密码相关的敏感数据。

## 相关链接

- [错误处理指南](/guide/error-handling)
- [安全最佳实践](/guide/security)
- [PDF文档加载](/api/get-document)
- [表单处理示例](/examples/forms)