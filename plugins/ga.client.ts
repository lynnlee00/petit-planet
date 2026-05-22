// plugins/ga.client.ts
import type { Router } from 'vue-router'

declare global {
  interface Window {
    dataLayer: any[]
    gtag?: (...args: any[]) => void
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const GA_ID = 'G-R69SYSG7DD'

  if (process.client) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments)
    }

    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', GA_ID)

    gtag('event', 'page_view', {
      page_path: window.location.pathname,
      page_title: document.title,
    })

    const router = nuxtApp.$router as Router
    router.afterEach((to) => {
      gtag('event', 'page_view', {
        page_path: to.fullPath,
        page_title: document.title,
      })
    })
  }
})
