'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('🔍 開始檢查認證狀態...')
        console.log('🌐 環境變數檢查:', {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
        })
        
        const supabase = createClient()
        console.log('✅ Supabase 客戶端創建成功')
        
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('🔐 認證檢查結果:', { 
          hasUser: !!user, 
          userId: user?.id, 
          error: error?.message 
        })
        
        if (error) {
          console.error('❌ 認證錯誤:', error)
          setTimeout(() => router.push('/login'), 500)
          return
        }
        
        if (user) {
          console.log('👤 用戶已登入，重定向到儀表板')
          setTimeout(() => router.push('/dashboard'), 500)
        } else {
          console.log('🚪 用戶未登入，重定向到登入頁面')
          setTimeout(() => router.push('/login'), 500)
        }
      } catch (error) {
        console.error('💥 Authentication check failed:', error)
        // 如果認證檢查失敗，重定向到登入頁面
        setTimeout(() => router.push('/login'), 1000)
      }
    }

    // 添加延遲以確保組件完全掛載
    const timer = setTimeout(checkAuthAndRedirect, 200)
    return () => clearTimeout(timer)
  }, [router])

  // 顯示載入畫面，同時進行重定向
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">📖</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">聖經讀經之旅</h1>
          <p className="text-xl text-white/90 mb-6">Bible Reading Quest</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <p className="text-white/80">正在載入應用程式...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
