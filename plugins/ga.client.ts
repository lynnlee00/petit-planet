// plugins/ga.client.ts
import type { Router } from 'vue-router'

declare global {
  interface Window {
    dataLayer: any[]
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const GA_ID = 'G-R69SYS7DD'

  if (process.client) {
    console.log('✅ GA plugin loaded')

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script.onload = () => console.log('✅ GA script loaded')
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      console.log('📡 GA event:', args)
      window.dataLayer.push(arguments)
    }

    gtag('js', new Date())
    gtag('config', GA_ID)

    // ✅ 立即上報首頁
    gtag('event', 'page_view', {
      page_path: window.location.pathname,
      page_title: document.title,
    })

    // ✅ 監聽頁面切換
    const router = nuxtApp.$router as Router
    router.afterEach((to) => {
      gtag('event', 'page_view', {
        page_path: to.fullPath,
        page_title: document.title,
      })
    })
  }
})