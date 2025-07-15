'use client'

import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { createClient } from '@/lib/supabase/client'
import { syncManager } from '@/lib/offline/syncManager'
import { parseReadingPlan, getHongKongToday, isHongKongToday } from '@/lib/chineseBibleAbbreviations'
import { celebrate } from '@/lib/utils/confetti'
import { useToast } from '@/components/ui/Toast'
import { logger } from '@/lib/utils/logger'
import type { User } from '@supabase/supabase-js'

interface OfflineCalendarViewProps {
  plan: { [date: string]: string[] }
  progress: Set<string>
  setProgress: (progress: Set<string>) => void
  user: User
}

function OfflineCalendarView({ plan, progress, setProgress, user }: OfflineCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // 動態設置每個月第一天的正確位置
  useEffect(() => {
    const updateCalendarLayout = () => {
      const calendar = document.querySelector('.calendar-container .react-calendar') as HTMLElement
      if (calendar) {
        // 獲取當前顯示的月份
        const navigationLabel = calendar.querySelector('.react-calendar__navigation__label')
        if (navigationLabel) {
          const labelText = navigationLabel.textContent || ''
          const match = labelText.match(/(\d{4})年(\d{1,2})月/)
          if (match) {
            const year = parseInt(match[1])
            const month = parseInt(match[2]) - 1 // JavaScript 月份從 0 開始
            
            // 計算該月第一天是星期幾 (0=星期日, 1=星期一, ...)
            const firstDay = new Date(year, month, 1).getDay()
            
            // 設置 CSS 變量，讓第一天從正確的位置開始
            // 星期日=1, 星期一=2, 星期二=3, ...
            const startColumn = firstDay + 1
            calendar.style.setProperty('--start-day', startColumn.toString())
            
            console.log(`${year}年${month + 1}月第一天是星期${firstDay}，應該從第${startColumn}格開始`)
          }
        }
      }
    }
    
    // 初始設置（延遲執行確保 DOM 完全渲染）
    const timer = setTimeout(updateCalendarLayout, 100)
    
    // 監聽導航變化
    const observer = new MutationObserver(() => {
      setTimeout(updateCalendarLayout, 50)
    })
    const calendar = document.querySelector('.calendar-container')
    if (calendar) {
      observer.observe(calendar, { childList: true, subtree: true })
    }
    
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const handleDateClick = useCallback(async (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    
    // 嚴格檢查：只允許點擊有讀經計劃的日期
    if (!plan[dateString] || !Array.isArray(plan[dateString]) || plan[dateString].length === 0) {
      logger.log('No reading plan for date:', dateString)
      return
    }
    
    const isCompleted = progress.has(dateString)
    const originalProgress = new Set(progress)

    try {
      // 樂觀更新 UI
      if (isCompleted) {
        progress.delete(dateString)
      } else {
        progress.add(dateString)
      }
      setProgress(new Set(progress))

      // 使用離線優先的同步管理器
      let success: boolean
      if (isCompleted) {
        success = await syncManager.removeReadingProgress(user.id, dateString)
      } else {
        success = await syncManager.recordReadingProgress(user.id, dateString)
        
        // 只有在新完成讀經計劃時才顯示慶祝動畫
        if (success) {
          logger.log('Showing confetti for completed reading plan:', dateString)
          celebrate({ type: 'basic', particleCount: 100 })
          toast.success('讀經完成！', '恭喜您完成今日的讀經計劃')
        }
      }

      if (!success) {
        // 如果操作失敗，恢復原始狀態
        setProgress(originalProgress)
        toast.error('操作失敗', '請檢查網路連接後再試')
      }
    } catch (error) {
      logger.error("更新進度失敗:", error)
      setProgress(originalProgress)
      toast.error('更新進度失敗', '請稍後再試或聯繫技術支援')
    }
  }, [plan, progress, setProgress, user.id, toast])

  const tileContent = useCallback(({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0]
    const readings = plan[dateString]
    const isCompleted = progress.has(dateString)

    // 完全自定義瓦片內容，包括日期
    return (
      <div className="custom-tile-content">
        <div className="date-number">
          {date.getDate()}
        </div>
        {readings && (
          <div className="plan-info">
            <div className="plan-text">
              {parseReadingPlan(readings)}
            </div>
            {isCompleted && (
              <div className="completion-check">✓</div>
            )}
          </div>
        )}
      </div>
    )
  }, [plan, progress])

  // 使用 useMemo 優化今日日期計算
  const hongKongToday = useMemo(() => getHongKongToday(), [])

  const tileClassName = useCallback(({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0]
    const readings = plan[dateString]
    const isCompleted = progress.has(dateString)
    const isToday = dateString === hongKongToday

    let className = 'relative min-h-[80px] p-2 '

    if (readings) {
      if (isCompleted) {
        // 完成的日子：綠色背景更明顯
        className += isToday ? 'bg-green-200 border-green-400 hover:bg-green-300 ring-2 ring-blue-400 ' : 'bg-green-200 border-green-400 hover:bg-green-300 '
      } else if (isToday) {
        // 今天：淺黃色背景
        className += 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200 ring-2 ring-blue-400 '
      } else {
        // 其他有計劃的日子：白色背景
        className += 'bg-white border-gray-200 hover:bg-gray-50 '
      }
    } else {
      if (isToday) {
        className += 'bg-blue-100 border-blue-300 ring-2 ring-blue-400 '
      } else {
        className += 'bg-gray-50 '
      }
    }

    return className
  }, [plan, progress, hongKongToday])

  return (
    <div className="w-full">
      {/* 離線狀態提示 */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-orange-600">📱</span>
            <span className="text-sm text-orange-800 font-medium">
              離線模式：您的進度將在網路恢復時自動同步
            </span>
          </div>
        </div>
      )}

      <div className="calendar-container">
        <Calendar
          onChange={(value) => {
            if (value instanceof Date) {
              setSelectedDate(value)
              handleDateClick(value)
            }
          }}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          showNeighboringMonth={false}
          showNavigation={true}
          navigationLabel={({ date }) => `${date.getFullYear()}年${date.getMonth() + 1}月`}
          formatMonthYear={(locale, date) => `${date.getFullYear()}年${date.getMonth() + 1}月`}
          prevLabel="‹"
          nextLabel="›"
          prev2Label={null}
          next2Label={null}
          locale="en-US"
          formatShortWeekday={(locale, date) => {
            // 星期日為第一天的中文標籤
            const weekdays = ['日', '一', '二', '三', '四', '五', '六']
            return weekdays[date.getDay()]
          }}
          minDetail="month"
          maxDetail="month"
          showWeekNumbers={false}
        />
      </div>

      {/* 今日讀經計劃詳情 */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-3 text-center">
          📖 今日讀經計劃 ({getHongKongToday()})
        </h3>
        
        {plan[hongKongToday] ? (
          <div className="space-y-2">
            {plan[hongKongToday].map((reading, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                progress.has(hongKongToday) 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    progress.has(hongKongToday)
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {progress.has(hongKongToday) ? '✓' : index + 1}
                  </span>
                  <span className="text-gray-700 font-medium">{reading}</span>
                </div>
              </div>
            ))}
            
            {progress.has(hongKongToday) && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600 text-2xl">🎉</span>
                  <span className="text-green-800 font-medium">恭喜！今日讀經已完成</span>
                  <span className="text-green-600 text-2xl">🎉</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <span className="text-gray-500 text-lg">📅</span>
            <p className="text-gray-500 mt-2">今日沒有安排讀經計劃</p>
          </div>
        )}
      </div>

      {/* 選中日期的詳細資訊 */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-3">
            {selectedDate.toLocaleDateString('zh-TW', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </h3>
          
          {plan[selectedDate.toISOString().split('T')[0]] ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">讀經計劃：</h4>
              {plan[selectedDate.toISOString().split('T')[0]].map((reading, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="text-sm text-gray-700">{reading}</span>
                </div>
              ))}
              
              {progress.has(selectedDate.toISOString().split('T')[0]) && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm text-green-800 font-medium">已完成</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">此日期沒有安排讀經計劃</p>
          )}
        </div>
      )}

      <style jsx>{`
        /* 隱藏默認的 abbr 元素，使用我們的自定義內容 */
        .calendar-container :global(.react-calendar__tile abbr),
        .calendar-container :global(.react-calendar__tile > abbr),
        .calendar-container :global(.react-calendar__tile abbr[title]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          position: absolute !important;
          left: -9999px !important;
        }
        
        /* 自定義瓦片內容樣式 */
        .custom-tile-content {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-start !important;
          position: relative !important;
          padding: 2px !important;
          box-sizing: border-box !important;
        }
        
        .date-number {
          font-size: 1rem !important;
          font-weight: 700 !important;
          color: inherit !important;
          margin-bottom: 2px !important;
          line-height: 1 !important;
        }
        
        .plan-info {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
        }
        
        .plan-text {
          font-size: 0.625rem !important;
          line-height: 1.1 !important;
          color: #374151 !important;
          text-align: center !important;
          font-weight: 500 !important;
          margin-bottom: 2px !important;
          word-break: break-word !important;
        }
        
        .completion-check {
          color: #16a34a !important;
          font-size: 0.875rem !important;
          font-weight: bold !important;
          line-height: 1 !important;
        }
        
        .calendar-container :global(.react-calendar) {
          width: 100% !important;
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          line-height: 1.125em !important;
          overflow: hidden !important;
        }
        
        .calendar-container :global(.react-calendar__navigation) {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
          background: #f8fafc;
          border-radius: 12px 12px 0 0;
        }
        
        .calendar-container :global(.react-calendar__navigation__label) {
          flex-grow: 1;
          pointer-events: none;
          cursor: default;
        }
        
        .calendar-container :global(.react-calendar__navigation button) {
          min-width: 44px;
          background: none;
          border: none;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }
        
        .calendar-container :global(.react-calendar__navigation button:hover) {
          background-color: #e5e7eb;
        }
        
        .calendar-container :global(.react-calendar__month-view__weekdays) {
          text-align: center !important;
          text-transform: uppercase !important;
          font-weight: bold !important;
          font-size: 0.75em !important;
          color: #6b7280 !important;
          background: #f9fafb !important;
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          gap: 1px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* 讓星期標題自然排列 */
        
        .calendar-container :global(.react-calendar__month-view__weekdays__weekday) {
          padding: 0.5em !important;
          border-bottom: 1px solid #e5e7eb !important;
          width: 100% !important;
          box-sizing: border-box !important;
          text-align: center !important;
        }
        
        .calendar-container :global(.react-calendar__month-view__days) {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          gap: 2px !important;
          width: 100% !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        
        /* 確保日期從正確的星期位置開始 */
        .calendar-container :global(.react-calendar__month-view__days .react-calendar__tile:first-child) {
          grid-column-start: var(--start-day, 1) !important;
        }
        
        /* 確保其他日期自然排列 */
        .calendar-container :global(.react-calendar__month-view__days .react-calendar__tile) {
          grid-column: auto !important;
        }
        
        /* 移除強制的星期排列，讓 react-calendar 自然處理 */
        
        /* 讓日期自然排列，不強制定位 */
        .calendar-container :global(.react-calendar__month-view__days > button) {
          /* 移除強制的 grid-column 設定，讓日期自然排列 */
        }
        
        .calendar-container :global(.react-calendar__tile) {
          max-width: 100% !important;
          width: 100% !important;
          background: none !important;
          border: 1px solid #e5e7eb !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
          position: relative !important;
          min-height: 80px !important;
          margin: 0 !important;
          padding: 4px !important;
        }
        
        @media (max-width: 768px) {
          .date-number {
            font-size: 0.875rem !important;
          }
          
          .plan-text {
            font-size: 0.5rem !important;
            line-height: 1 !important;
          }
          
          .completion-check {
            font-size: 0.75rem !important;
          }
          
          .calendar-container :global(.react-calendar__tile) {
            min-height: 60px !important;
            padding: 2px !important;
          }
        }
        
        @media (max-width: 480px) {
          .date-number {
            font-size: 0.875rem !important;
            margin-bottom: 2px !important;
          }
          
          .plan-text {
            font-size: 0.6rem !important;
            line-height: 1.1 !important;
          }
          
          .completion-check {
            font-size: 0.75rem !important;
          }
          
          .calendar-container :global(.react-calendar__tile) {
            min-height: 50px !important;
            padding: 1px !important;
          }
          
          .calendar-container :global(.react-calendar__month-view__days) {
            gap: 1px !important;
          }
          
          .calendar-container :global(.react-calendar__month-view__weekdays) {
            gap: 0px !important;
          }
          
          .calendar-container :global(.react-calendar__month-view__weekdays__weekday) {
            padding: 0.25em !important;
            font-size: 0.625rem !important;
          }
        }
        
        /* 完成的日期樣式 */
        .calendar-container :global(.react-calendar__tile.bg-green-200) {
          background: #bbf7d0 !important;
          border-color: #4ade80 !important;
        }
        
        .calendar-container :global(.react-calendar__tile.bg-green-200:hover) {
          background: #86efac !important;
        }
        
        /* 今天的日期樣式 */
        .calendar-container :global(.react-calendar__tile.bg-yellow-100) {
          background: #fef3c7 !important;
          border-color: #fbbf24 !important;
        }
        
        .calendar-container :global(.react-calendar__tile.bg-yellow-100:hover) {
          background: #fde68a !important;
        }
        
        /* 普通日期樣式 */
        .calendar-container :global(.react-calendar__tile.bg-white) {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
        }
        
        .calendar-container :global(.react-calendar__tile.bg-white:hover) {
          background: #f9fafb !important;
        }
        
        .calendar-container :global(.react-calendar__tile:hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .calendar-container :global(.react-calendar__tile--now) {
          background: #fef3c7 !important;
          border-color: #f59e0b !important;
        }
        
        .calendar-container :global(.react-calendar__tile--active) {
          background: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  )
}

// 使用 memo 優化組件，避免不必要的重渲染
export default memo(OfflineCalendarView)