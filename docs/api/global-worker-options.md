# GlobalWorkerOptions

`GlobalWorkerOptions` 是 PDF.js 的全局配置对象，用于设置 PDF.js Worker 的相关选项。

## 概述

PDF.js 使用 Web Worker 来处理 PDF 文件的解析和渲染，以避免阻塞主线程。`GlobalWorkerOptions` 提供了配置 Worker 的接口。

## 属性

### workerSrc

- **类型**: `string`
- **描述**: PDF.js Worker 脚本的路径
- **必需**: 是

设置 PDF.js Worker 脚本的 URL 路径。这是使用 PDF.js 之前必须配置的选项。

```javascript
import * as pdfjsLib from 'pdfjs-dist'

// 设置 Worker 路径
pdfjsLib.GlobalWorkerOptions.workerSrc = '/path/to/pdf.worker.min.js'
```

### workerPort

- **类型**: `Worker | null`
- **描述**: 自定义的 Worker 实例
- **默认值**: `null`

如果需要使用自定义的 Worker 实例，可以通过此属性设置。

```javascript
// 使用自定义 Worker
const customWorker = new Worker('/custom-pdf-worker.js')
pdfjsLib.GlobalWorkerOptions.workerPort = customWorker
```

## 常见配置方式

### 1. 使用 CDN

```javascript
import * as pdfjsLib from 'pdfjs-dist'

// 使用 CDN 上的 Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
```

### 2. 使用本地文件

```javascript
import * as pdfjsLib from 'pdfjs-dist'

// 使用本地 Worker 文件
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js'
```

### 3. 在 Webpack 项目中

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

// 在 Webpack 中使用
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
```

### 4. 在 Vite 项目中

```javascript
import * as pdfjsLib from 'pdfjs-dist'

// 在 Vite 中使用
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()
```

## 注意事项

1. **必须在使用 PDF.js 之前设置**: `workerSrc` 必须在调用任何 PDF.js API 之前设置。

2. **路径正确性**: 确保 Worker 脚本路径正确且可访问。

3. **CORS 问题**: 如果使用 CDN，确保没有跨域问题。

4. **版本匹配**: Worker 脚本版本应与 PDF.js 库版本匹配。

## 错误处理

如果 Worker 配置不正确，会抛出相关错误：

```javascript
try {
  const pdf = await pdfjsLib.getDocument(url).promise
} catch (error) {
  if (error.message.includes('worker')) {
    console.error('Worker 配置错误:', error)
    // 检查 workerSrc 设置
  }
}
```

## 相关链接

- [快速开始](/guide/getting-started)
- [安装配置](/guide/installation)
- [错误处理](/guide/error-handling)