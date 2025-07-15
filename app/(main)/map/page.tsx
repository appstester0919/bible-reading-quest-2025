'use client'

import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ALL_BOOKS } from '@/lib/bibleData'
import MapView from '@/components/MapView'
import ErrorBoundary from '@/components/ErrorBoundary'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { logger } from '@/lib/utils/logger'
import type { User } from '@supabase/supabase-js'

// Helper function to parse reading strings like "Genesis 1-3" or "John 3"
const getBookFromReading = (reading: string): string => {
  return reading.split(' ').slice(0, -1).join(' ')
}

// Simplified book completion calculation - more stable for iOS
const calculateCompletedBooks = (planData: { [date: string]: string[] }, completedDates: Set<string>): string[] => {
  const completed: string[] = []
  
  try {
    ALL_BOOKS.forEach(book => {
      const datesForBook: string[] = []
      
      // Find all dates that include this book
      Object.entries(planData).forEach(([date, readings]) => {
        if (readings && Array.isArray(readings)) {
          if (readings.some(r => r && typeof r === 'string' && getBookFromReading(r) === book.name)) {
            datesForBook.push(date)
          }
        }
      })

      // Check if all dates for this book are completed
      if (datesForBook.length > 0 && datesForBook.every(date => completedDates.has(date))) {
        completed.push(book.name)
      }
    })
  } catch (error) {
    logger.warn('Error calculating completed books:', error)
  }
  
  return completed
}

function MapPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [plan, setPlan] = useState<{ [date: string]: string[] } | null>(null)
  const [completedBooks, setCompletedBooks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }
        setUser(user)

        // Get plan data
        const { data: planData, error: planError } = await supabase
          .from('reading_plans')
          .select('generated_plan')
          .eq('user_id', user.id)
          .single()

        if (planError || !planData) {
          setIsLoading(false)
          return
        }

        setPlan(planData.generated_plan)

        // Get progress data
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('read_date')
          .eq('user_id', user.id)

        if (progressError) {
          logger.warn('Progress fetch error:', progressError)
          toast.warning('進度載入警告', '部分進度資料可能不完整')
          setCompletedBooks([]) // Default to empty if error
        } else {
          const completedDates = new Set(progressData?.map(p => p.read_date) || [])
          const completed = calculateCompletedBooks(planData.generated_plan, completedDates)
          setCompletedBooks(completed)
        }

        setIsLoading(false)
      } catch (err: any) {
        logger.error('Error fetching map data:', err)
        setError(err.message || 'Unknown error')
        toast.error('載入失敗', '無法載入地圖資料，請稍後再試')
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  if (isLoading) {
    return <PageLoader text="載入您的讀經進度地圖..." />
  }

  if (error) {
    return (
      <div className="min-h-screen mobile-app-container flex items-center justify-center">
        <div className="card-modern p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">載入錯誤</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen mobile-app-container flex items-center justify-center">
        <div className="card-modern p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-blue-600 text-2xl">👤</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">請先登入</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">您需要登入才能查看您的地圖進度。</p>
          <Link href="/login" className="btn-primary inline-block">前往登入</Link>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen mobile-app-container flex items-center justify-center">
        <div className="card-modern p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">🗺️</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">尚未建立讀經計劃</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">您需要先建立一個讀經計劃才能查看您的地圖進度。</p>
          <Link href="/plan" className="btn-primary inline-block">立即制定計劃</Link>
        </div>
      </div>
    )
  }

  const showEncouragement = completedBooks.length > 0 && completedBooks.length % 3 === 0
  const showFireworks = completedBooks.length === ALL_BOOKS.length

  return (
    <div className="min-h-screen mobile-app-container">
      <div className="container-responsive py-4 md:py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">我的拼圖地圖</h1>
          <p className="text-white/80 text-sm md:text-base">
            每完成一卷書，就會點亮一塊地圖。已完成 {completedBooks.length} / {ALL_BOOKS.length} 卷。
          </p>
        </div>
        <div className="card-modern p-4 md:p-6 mb-16 max-w-6xl mx-auto">
          <MapView 
            completedBooks={completedBooks} 
            showEncouragement={showEncouragement} 
            showFireworks={showFireworks} 
          />
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-red-50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 max-w-md text-center">
            <h1 className="text-xl font-bold text-red-600 mb-4">❌ 地圖載入失敗</h1>
            <p className="text-gray-600 mb-4">很抱歉，地圖頁面遇到問題。</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                重新載入
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full"
              >
                返回主頁
              </button>
            </div>
          </div>
        </div>
      }
    >
      <MapPageContent />
    </ErrorBoundary>
  )
}