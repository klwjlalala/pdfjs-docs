import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 应用错误:', err)
  console.error('错误信息:', info)
  console.error('组件实例:', vm)
}

// 全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue 警告:', msg)
  console.warn('组件追踪:', trace)
}

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('PDF.js Vue 示例应用已启动')
  console.log('环境:', import.meta.env.MODE)
  
  // 添加一些有用的全局方法到 window 对象
  window.__VUE_APP__ = app
  window.__PDF_DEBUG__ = {
    // 检查 PDF.js 是否正确加载
    checkPDFJS: async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        console.log('PDF.js 版本:', pdfjsLib.version)
        console.log('PDF.js 构建:', pdfjsLib.build)
        return true
      } catch (err) {
        console.error('PDF.js 加载失败:', err)
        return false
      }
    },
    
    // 检查 Worker 配置
    checkWorker: async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        console.log('Worker 源:', pdfjsLib.GlobalWorkerOptions.workerSrc)
        return true
      } catch (err) {
        console.error('Worker 检查失败:', err)
        return false
      }
    }
  }
  
  // 自动检查 PDF.js 配置
  setTimeout(async () => {
    console.log('=== PDF.js 配置检查 ===')
    await window.__PDF_DEBUG__.checkPDFJS()
    await window.__PDF_DEBUG__.checkWorker()
    console.log('=== 检查完成 ===')
  }, 1000)
}

// 生产环境优化
if (import.meta.env.PROD) {
  // 禁用 Vue 开发工具
  app.config.devtools = false
  
  // 禁用生产提示
  app.config.productionTip = false
}

export default app