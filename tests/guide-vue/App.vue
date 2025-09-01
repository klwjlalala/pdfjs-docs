<template>
  <div class="app">
    <h1>PDF 查看器示例</h1>

    <div class="pdf-viewer-container">
      <PDFViewer :src="pdfUrl" @loaded="onPDFLoaded" @progress="onProgress" @error="onError"
        @page-rendered="onPageRendered" />
    </div>

    <!-- 进度显示 -->
    <div v-if="loadingProgress > 0 && loadingProgress < 100" class="progress-bar">
      <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
      <span class="progress-text">{{ loadingProgress }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import PDFViewer from './components/PDFViewer.vue'
import PDFUrl from './基于方位一致性的分支点检测算法.pdf'

// 响应式数据
const loadingProgress = ref(0)
/**
 * PDF 加载完成回调
 */
const onPDFLoaded = (pdf) => {
  console.log('PDF 加载完成，总页数:', pdf.numPages)
  loadingProgress.value = 0
}

/**
 * 加载进度回调
 */
const onProgress = (percent) => {
  loadingProgress.value = percent
  console.log('加载进度:', percent + '%')
}

/**
 * 错误处理回调
 */
const onError = (error) => {
  console.error('PDF 加载错误:', error)
  alert('PDF 加载失败: ' + error.message)
  loadingProgress.value = 0
}

/**
 * 页面渲染完成回调
 */
const onPageRendered = (pageNum) => {
  console.log('页面', pageNum, '渲染完成')
}


</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app h1 {
  text-align: center;
  padding: 20px;
  background: #2c3e50;
  color: white;
  margin: 0;
}

.pdf-viewer-container {
  flex: 1;
  overflow: hidden;
}

.progress-bar {
  position: relative;
  height: 4px;
  background: #ecf0f1;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: -25px;
  right: 10px;
  font-size: 12px;
  color: #7f8c8d;
}
</style>