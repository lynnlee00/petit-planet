// plugins/ga.client.ts
import type { Router } from 'vue-router'

declare global {
  interface Window {
    dataLayer: any[]
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const GA_ID = 'G-R69SYSG7DD' // ← 換成你的 GA4 測量 ID

  if (process.client) {
    // 動態載入 GA 腳本
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)

    // 初始化 gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }

    gtag('js', new Date())
    gtag('config', GA_ID)

    // ✅ 明確指定 router 型別
    const router = nuxtApp.$router as Router

    router.afterEach((to) => {
      gtag('event', 'page_view', {
        page_path: to.fullPath,
        page_title: document.title,
      })
    })
  }
})
