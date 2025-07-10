// 圖片優化工具
export const optimizeImageUrl = (url: string, width?: number, quality = 75) => {
  if (process.env.NODE_ENV === 'production') {
    // 在生產環境中，可以使用 Next.js Image Optimization API
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    params.set('q', quality.toString())
    
    return `/_next/image?url=${encodeURIComponent(url)}&${params.toString()}`
  }
  return url
}

// 預載入關鍵圖片
export const preloadImage = (src: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  }
}

// 懶載入圖片
export const lazyLoadImage = (element: HTMLImageElement, src: string) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          element.src = src
          observer.unobserve(element)
        }
      })
    })
    observer.observe(element)
  } else {
    // Fallback for older browsers
    element.src = src
  }
}