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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

// 配置 PDF.js Worker 路径
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['progress', 'loaded', 'error', 'page-rendered'])

// 响应式数据
const pdf = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1)
const loading = ref(false)
const error = ref(null)
const pdfContainer = ref(null)
const pdfCanvas = ref(null)

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
watch(() => props.src, () => {
  loadPDF()
})

// 生命周期钩子
onMounted(() => {
  loadPDF()
})

onUnmounted(() => {
  // 清理资源
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