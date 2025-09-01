# 在 Vue 中使用 PDF.js

本指南将详细介绍如何在 Vue 项目中集成和使用 PDF.js 来显示和操作 PDF 文档。

## 安装依赖

在 Vue 项目中使用 PDF.js，首先安装必要的依赖：

::: code-group

```bash [npm]
npm install pdfjs-dist
```

```bash [yarn]
yarn add pdfjs-dist
```

```bash [pnpm]
pnpm add pdfjs-dist
```

:::

## 创建 PDF 查看器组件

创建一个可复用的 PDF 查看器组件：

```vue
<template>
  <div class="pdf-viewer">
    <div class="pdf-controls">
      <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">下一页</button>
      <select v-model="scale" @change="renderCurrentPage">
        <option value="0.5">50%</option>
        <option value="0.75">75%</option>
        <option value="1">100%</option>
        <option value="1.25">125%</option>
        <option value="1.5">150%</option>
        <option value="2">200%</option>
      </select>
    </div>
    <div class="pdf-container" ref="pdfContainer">
      <canvas ref="pdfCanvas"></canvas>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

// 配置 Worker - 使用本地路径
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.js'

// Props
const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['loaded', 'error', 'progress', 'page-rendered'])

// Template refs
const pdfContainer = ref(null)
const pdfCanvas = ref(null)

// 响应式数据
const pdf = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1)
const loading = ref(false)
const error = ref(null)

/**
 * 加载 PDF 文档
 */
const loadPDF = async () => {
  loading.value = true
  error.value = null
  
  try {
    const loadingTask = pdfjsLib.getDocument(props.src)
    
    // 监听加载进度
    loadingTask.onProgress = (progress) => {
      const percent = Math.round((progress.loaded / progress.total) * 100)
      emit('progress', percent)
    }
    
    pdf.value = await loadingTask.promise
    totalPages.value = pdf.value.numPages
    currentPage.value = 1
    
    await renderCurrentPage()
    emit('loaded', pdf.value)
  } catch (err) {
    error.value = `加载 PDF 失败: ${err.message}`
    emit('error', err)
  } finally {
    loading.value = false
  }
}

/**
 * 渲染当前页面
 */
const renderCurrentPage = async () => {
  if (!pdf.value) return
  
  try {
    const page = await pdf.value.getPage(currentPage.value)
    const viewport = page.getViewport({ scale: scale.value })
    
    const canvas = pdfCanvas.value
    const context = canvas.getContext('2d')
    
    // 设置 Canvas 尺寸
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    // 处理高 DPI 屏幕
    const outputScale = window.devicePixelRatio || 1
    if (outputScale !== 1) {
      canvas.width *= outputScale
      canvas.height *= outputScale
      canvas.style.width = viewport.width + 'px'
      canvas.style.height = viewport.height + 'px'
      context.scale(outputScale, outputScale)
    }
    
    // 渲染页面
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    
    await page.render(renderContext).promise
    emit('page-rendered', currentPage.value)
  } catch (err) {
    error.value = `渲染页面失败: ${err.message}`
  }
}

/**
 * 上一页
 */
const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await renderCurrentPage()
  }
}

/**
 * 下一页
 */
const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await renderCurrentPage()
  }
}

/**
 * 跳转到指定页面
 */
const goToPage = async (pageNum) => {
  if (pageNum >= 1 && pageNum <= totalPages.value) {
    currentPage.value = pageNum
    await renderCurrentPage()
  }
}

// 监听 src 变化
watch(() => props.src, loadPDF)

// 组件挂载时加载 PDF
onMounted(loadPDF)

// 组件卸载时清理资源
onUnmounted(() => {
  if (pdf.value) {
    pdf.value.destroy()
  }
})
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.pdf-controls button {
  padding: 5px 10px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.pdf-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pdf-controls select {
  padding: 5px;
  border: 1px solid #ccc;
}

.pdf-container {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background: #f9f9f9;
}

.pdf-container canvas {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: white;
}

.loading, .error {
  text-align: center;
  padding: 20px;
}

.error {
  color: #d32f2f;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  margin: 10px;
}
</style>
```

## 在父组件中使用

```vue
<template>
  <div class="app">
    <h1>PDF 查看器示例</h1>
    <PDFViewer 
      :src="pdfUrl" 
      @loaded="onPDFLoaded"
      @progress="onProgress"
      @error="onError"
      @page-rendered="onPageRendered"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PDFViewer from './components/PDFViewer.vue'

// 响应式数据
const pdfUrl = ref('/path/to/your/document.pdf')

/**
 * PDF 加载完成回调
 */
const onPDFLoaded = (pdf) => {
  console.log('PDF 加载完成，总页数:', pdf.numPages)
}

/**
 * 加载进度回调
 */
const onProgress = (percent) => {
  console.log('加载进度:', percent + '%')
}

/**
 * 错误处理回调
 */
const onError = (error) => {
  console.error('PDF 加载错误:', error)
}

/**
 * 页面渲染完成回调
 */
const onPageRendered = (pageNum) => {
  console.log('页面', pageNum, '渲染完成')
}
</script>
```



## 最佳实践

### 1. 错误处理

```vue
<script setup>
import { ref } from 'vue'

const emit = defineEmits(['password-required'])
const error = ref(null)

const loadPDF = async () => {
  try {
    // PDF 加载逻辑
  } catch (err) {
    // 根据错误类型提供不同的处理
    if (err.name === 'PasswordException') {
      error.value = 'PDF 文件需要密码'
      emit('password-required')
    } else if (err.name === 'InvalidPDFException') {
      error.value = 'PDF 文件格式无效'
    } else {
      error.value = `加载失败: ${err.message}`
    }
  }
}
</script>
```

### 2. 性能优化

```vue
<script setup>
import { ref } from 'vue'

const pdf = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)

/**
 * 延迟加载页面
 */
const lazyLoadPage = async (pageNum) => {
  // 只渲染可见页面
  if (isPageVisible(pageNum)) {
    await renderPage(pageNum)
  }
}

/**
 * 预加载相邻页面
 */
const preloadAdjacentPages = async () => {
  const promises = []
  if (currentPage.value > 1) {
    promises.push(pdf.value.getPage(currentPage.value - 1))
  }
  if (currentPage.value < totalPages.value) {
    promises.push(pdf.value.getPage(currentPage.value + 1))
  }
  await Promise.all(promises)
}
</script>
```

### 3. 响应式设计

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const pdfContainer = ref(null)
const pdf = ref(null)
const scale = ref(1)

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  // 重新计算缩放比例
  calculateOptimalScale()
  renderCurrentPage()
}

/**
 * 计算最佳缩放比例
 */
const calculateOptimalScale = async () => {
  const container = pdfContainer.value
  if (container && pdf.value) {
    const containerWidth = container.clientWidth - 40 // 减去 padding
    const page = await pdf.value.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    scale.value = containerWidth / viewport.width
  }
}

onMounted(() => {
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
```

## 常见问题

### Q: 如何处理密码保护的 PDF？

A: 监听 `PasswordException` 并提示用户输入密码：

```vue
<script setup>
import { ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const pdf = ref(null)

const loadPDF = async (password = null) => {
  try {
    const loadingTask = pdfjsLib.getDocument({
      url: props.src,
      password: password
    })
    pdf.value = await loadingTask.promise
  } catch (err) {
    if (err.name === 'PasswordException') {
      const userPassword = prompt('请输入 PDF 密码:')
      if (userPassword) {
        await loadPDF(userPassword)
      }
    }
  }
}

/**
 * 提取 PDF 文本内容
 */
const extractText = async () => {
  if (!pdf.value) return ''
  
  let fullText = ''
  for (let i = 1; i <= pdf.value.numPages; i++) {
    const page = await pdf.value.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }
  return fullText
}
</script>
```

### Q: 如何提取 PDF 文本？

A: 使用 `getTextContent()` 方法：

```vue
<script setup>
import { ref } from 'vue'

const pdf = ref(null)

/**
 * 提取页面文本
 */
const extractText = async (pageNum) => {
  const page = await pdf.value.getPage(pageNum)
  const textContent = await page.getTextContent()
  return textContent.items.map(item => item.str).join(' ')
}
</script>
```

### Q: 如何实现文本搜索？

A: 结合文本提取和高亮显示：

```vue
<script setup>
import { ref } from 'vue'

const totalPages = ref(0)

/**
 * 搜索文本
 */
const searchText = async (searchTerm) => {
  const results = []
  for (let i = 1; i <= totalPages.value; i++) {
    const text = await extractText(i)
    if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
      results.push({ page: i, text })
    }
  }
  return results
}
</script>
```

## 下一步

- [React 集成指南](/guide/react-integration) - 学习在 React 中使用 PDF.js
- [本地开发指南](/guide/local-development) - 了解如何本地运行 PDF.js 源码
- [API 文档](/api/) - 查看完整的 API 参考
- [性能优化](/guide/performance) - 学习性能优化技巧