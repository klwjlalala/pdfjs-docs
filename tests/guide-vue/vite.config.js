import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 代理配置（如果需要）
    proxy: {
      // '/api': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist'],
          'vue': ['vue']
        }
      }
    }
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      'components': resolve(__dirname, './components')
    }
  },
  
  // 优化配置
  optimizeDeps: {
    include: [
      'vue',
      'pdfjs-dist'
    ],
    exclude: [
      // PDF.js worker 需要排除以避免优化问题
      'pdfjs-dist/build/pdf.worker.entry'
    ]
  },
  
  // 静态资源处理
  assetsInclude: [
    '**/*.pdf'
  ],
  
  // 环境变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})