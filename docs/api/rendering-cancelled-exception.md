# RenderingCancelledException

`RenderingCancelledException` 是 PDF.js 中用于表示渲染操作被取消的异常类。当 PDF 页面渲染过程被主动取消时，会抛出此异常。

## 概述

渲染取消异常通常在以下情况下发生：
- 用户主动取消渲染操作
- 应用程序需要中断当前渲染以开始新的渲染
- 页面组件被销毁或卸载
- 渲染超时或资源限制

## 属性

### name

异常名称，固定为 `"RenderingCancelledException"`。

**类型**: `string`

```javascript
try {
  await page.render(renderContext).promise
} catch (error) {
  if (error.name === 'RenderingCancelledException') {
    console.log('渲染被取消')
  }
}
```

### message

异常描述信息。

**类型**: `string`

```javascript
try {
  await page.render(renderContext).promise
} catch (error) {
  if (error.name === 'RenderingCancelledException') {
    console.log('取消原因:', error.message)
  }
}
```

### type

取消类型，指示取消的具体原因。

**类型**: `string`

可能的值：
- `"canvas"`: Canvas 相关的取消
- `"display"`: 显示相关的取消
- `"print"`: 打印相关的取消

```javascript
try {
  await page.render(renderContext).promise
} catch (error) {
  if (error.name === 'RenderingCancelledException') {
    console.log('取消类型:', error.type)
  }
}
```

## 使用示例

### 基本异常处理

```javascript
import * as pdfjsLib from 'pdfjs-dist'

/**
 * 渲染PDF页面并处理取消异常
 */
async function renderPDFPage(page, canvas) {
  const context = canvas.getContext('2d')
  const viewport = page.getViewport({ scale: 1.0 })
  
  canvas.height = viewport.height
  canvas.width = viewport.width
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  }
  
  try {
    await page.render(renderContext).promise
    console.log('页面渲染完成')
  } catch (error) {
    if (error.name === 'RenderingCancelledException') {
      console.log('渲染被取消:', error.message)
      console.log('取消类型:', error.type)
      // 不需要显示错误给用户，这是正常的取消操作
    } else {
      console.error('渲染失败:', error)
      throw error
    }
  }
}
```

### 可取消的渲染任务

```javascript
import * as pdfjsLib from 'pdfjs-dist'

/**
 * 可取消的PDF渲染器
 */
class CancellablePDFRenderer {
  constructor() {
    this.currentRenderTask = null
  }
  
  /**
   * 渲染页面
   */
  async renderPage(page, canvas, options = {}) {
    // 取消之前的渲染任务
    this.cancelCurrentRender()
    
    const context = canvas.getContext('2d')
    const viewport = page.getViewport({ scale: options.scale || 1.0 })
    
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      intent: options.intent || 'display'
    }
    
    // 开始新的渲染任务
    this.currentRenderTask = page.render(renderContext)
    
    try {
      await this.currentRenderTask.promise
      console.log('页面渲染完成')
      this.currentRenderTask = null
    } catch (error) {
      this.currentRenderTask = null
      
      if (error.name === 'RenderingCancelledException') {
        console.log('渲染被取消')
        // 返回特殊值表示取消
        return { cancelled: true, reason: error.message }
      } else {
        console.error('渲染失败:', error)
        throw error
      }
    }
    
    return { cancelled: false }
  }
  
  /**
   * 取消当前渲染
   */
  cancelCurrentRender() {
    if (this.currentRenderTask) {
      console.log('取消当前渲染任务')
      this.currentRenderTask.cancel()
      this.currentRenderTask = null
    }
  }
  
  /**
   * 检查是否有正在进行的渲染
   */
  isRendering() {
    return this.currentRenderTask !== null
  }
}

// 使用示例
const renderer = new CancellablePDFRenderer()
const canvas = document.getElementById('pdf-canvas')

// 加载PDF并渲染
pdfjsLib.getDocument('/path/to/document.pdf').promise
  .then(async pdf => {
    const page = await pdf.getPage(1)
    
    // 渲染页面
    const result = await renderer.renderPage(page, canvas, { scale: 1.5 })
    
    if (result.cancelled) {
      console.log('渲染被取消:', result.reason)
    } else {
      console.log('渲染成功完成')
    }
  })
  .catch(error => {
    console.error('加载PDF失败:', error)
  })

// 5秒后取消渲染
setTimeout(() => {
  renderer.cancelCurrentRender()
}, 5000)
```

### React组件中的渲染取消

```javascript
import React, { useRef, useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

/**
 * 支持取消的PDF页面组件
 */
const CancellablePDFPage = ({ pdfUrl, pageNumber, scale = 1.0 }) => {
  const canvasRef = useRef(null)
  const renderTaskRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  /**
   * 取消当前渲染
   */
  const cancelRender = () => {
    if (renderTaskRef.current) {
      console.log('取消渲染任务')
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }
  }
  
  /**
   * 渲染页面
   */
  const renderPage = async () => {
    if (!canvasRef.current) return
    
    // 取消之前的渲染
    cancelRender()
    
    setLoading(true)
    setError(null)
    
    try {
      // 加载PDF
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise
      const page = await pdf.getPage(pageNumber)
      
      // 设置canvas
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      const viewport = page.getViewport({ scale })
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      // 开始渲染
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      renderTaskRef.current = page.render(renderContext)
      
      await renderTaskRef.current.promise
      
      console.log('页面渲染完成')
      renderTaskRef.current = null
      
    } catch (err) {
      renderTaskRef.current = null
      
      if (err.name === 'RenderingCancelledException') {
        console.log('渲染被取消:', err.message)
        // 不设置错误状态，因为这是正常的取消
      } else {
        console.error('渲染失败:', err)
        setError('渲染失败: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }
  
  // 当props变化时重新渲染
  useEffect(() => {
    if (pdfUrl && pageNumber) {
      renderPage()
    }
    
    // 清理函数：组件卸载时取消渲染
    return () => {
      cancelRender()
    }
  }, [pdfUrl, pageNumber, scale])
  
  return (
    <div className="pdf-page-container">
      {loading && <div className="loading-overlay">渲染中...</div>}
      {error && <div className="error-message">{error}</div>}
      <canvas 
        ref={canvasRef}
        className="pdf-canvas"
        style={{ display: loading ? 'none' : 'block' }}
      />
      <button onClick={cancelRender} disabled={!loading}>
        取消渲染
      </button>
    </div>
  )
}

export default CancellablePDFPage
```

### 批量渲染中的取消处理

```javascript
import * as pdfjsLib from 'pdfjs-dist'

/**
 * 批量PDF渲染器
 */
class BatchPDFRenderer {
  constructor() {
    this.renderTasks = new Map()
    this.cancelled = false
  }
  
  /**
   * 批量渲染多个页面
   */
  async renderPages(pdf, pageNumbers, canvases, options = {}) {
    this.cancelled = false
    const results = []
    
    try {
      for (let i = 0; i < pageNumbers.length; i++) {
        if (this.cancelled) {
          console.log('批量渲染被取消')
          break
        }
        
        const pageNumber = pageNumbers[i]
        const canvas = canvases[i]
        
        console.log(`渲染页面 ${pageNumber}/${pdf.numPages}`)
        
        try {
          const result = await this.renderSinglePage(
            pdf, 
            pageNumber, 
            canvas, 
            options
          )
          results.push({ pageNumber, success: true, result })
        } catch (error) {
          if (error.name === 'RenderingCancelledException') {
            console.log(`页面 ${pageNumber} 渲染被取消`)
            results.push({ pageNumber, success: false, cancelled: true })
          } else {
            console.error(`页面 ${pageNumber} 渲染失败:`, error)
            results.push({ pageNumber, success: false, error: error.message })
          }
        }
      }
    } catch (error) {
      console.error('批量渲染过程中发生错误:', error)
    }
    
    return results
  }
  
  /**
   * 渲染单个页面
   */
  async renderSinglePage(pdf, pageNumber, canvas, options) {
    const page = await pdf.getPage(pageNumber)
    const context = canvas.getContext('2d')
    const viewport = page.getViewport({ scale: options.scale || 1.0 })
    
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      intent: options.intent || 'display'
    }
    
    const renderTask = page.render(renderContext)
    this.renderTasks.set(pageNumber, renderTask)
    
    try {
      await renderTask.promise
      this.renderTasks.delete(pageNumber)
      return { completed: true }
    } catch (error) {
      this.renderTasks.delete(pageNumber)
      throw error
    }
  }
  
  /**
   * 取消所有渲染任务
   */
  cancelAll() {
    console.log('取消所有渲染任务')
    this.cancelled = true
    
    this.renderTasks.forEach((task, pageNumber) => {
      console.log(`取消页面 ${pageNumber} 的渲染`)
      task.cancel()
    })
    
    this.renderTasks.clear()
  }
  
  /**
   * 获取当前渲染状态
   */
  getStatus() {
    return {
      cancelled: this.cancelled,
      activeTasks: this.renderTasks.size,
      activePages: Array.from(this.renderTasks.keys())
    }
  }
}

// 使用示例
const batchRenderer = new BatchPDFRenderer()

async function renderAllPages() {
  try {
    const pdf = await pdfjsLib.getDocument('/path/to/document.pdf').promise
    const pageNumbers = Array.from({ length: pdf.numPages }, (_, i) => i + 1)
    const canvases = pageNumbers.map(() => document.createElement('canvas'))
    
    console.log(`开始渲染 ${pdf.numPages} 页`)
    
    const results = await batchRenderer.renderPages(
      pdf, 
      pageNumbers, 
      canvases, 
      { scale: 0.5 }
    )
    
    console.log('渲染结果:', results)
    
    // 统计结果
    const successful = results.filter(r => r.success).length
    const cancelled = results.filter(r => r.cancelled).length
    const failed = results.filter(r => !r.success && !r.cancelled).length
    
    console.log(`渲染完成: 成功 ${successful}, 取消 ${cancelled}, 失败 ${failed}`)
    
  } catch (error) {
    console.error('批量渲染失败:', error)
  }
}

// 开始渲染
renderAllPages()

// 10秒后取消所有渲染
setTimeout(() => {
  batchRenderer.cancelAll()
}, 10000)
```

## 最佳实践

1. **优雅处理**: 将渲染取消视为正常操作，不要显示错误信息给用户。

2. **资源清理**: 取消渲染后及时清理相关资源和引用。

3. **状态管理**: 正确维护渲染状态，避免重复取消或启动。

4. **用户反馈**: 在长时间渲染时提供取消选项和进度指示。

5. **内存管理**: 大量页面渲染时要考虑内存使用和垃圾回收。

## 注意事项

1. **异步操作**: 渲染取消是异步的，可能不会立即生效。

2. **状态检查**: 在处理渲染结果前检查是否被取消。

3. **重复取消**: 多次调用cancel()是安全的，不会产生副作用。

4. **组件生命周期**: 在React等框架中要在组件卸载时取消渲染。

5. **错误传播**: 不要将取消异常向上传播给用户界面。

## 相关链接

- [PDF页面渲染](/api/pdf-page-proxy#render)
- [错误处理指南](/guide/error-handling)
- [性能优化](/guide/performance)
- [React集成示例](/examples/react-integration)