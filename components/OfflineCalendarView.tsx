'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import { createClient } from '@/lib/supabase/client'
import { syncManager } from '@/lib/offline/syncManager'
import confetti from 'canvas-confetti'
import type { User } from '@supabase/supabase-js'

interface OfflineCalendarViewProps {
  plan: { [date: string]: string[] }
  progress: Set<string>
  setProgress: (progress: Set<string>) => void
  user: User
}

export default function OfflineCalendarView({ plan, progress, setProgress, user }: OfflineCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const supabase = createClient()

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

  const handleDateClick = async (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
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
        
        // 如果是新完成的日期，顯示慶祝動畫
        if (success) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        }
      }

      if (!success) {
        // 如果操作失敗，恢復原始狀態
        setProgress(originalProgress)
        alert('操作失敗，請稍後再試')
      }
    } catch (error) {
      console.error("更新進度失敗:", error)
      setProgress(originalProgress)
      alert('操作失敗，請稍後再試')
    }
  }

  const tileContent = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0]
    const readings = plan[dateString]
    const isCompleted = progress.has(dateString)

    if (!readings) return null

    return (
      <div className="relative">
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
        <div className="text-xs mt-1 space-y-1">
          {readings.slice(0, 2).map((reading, index) => (
            <div 
              key={index} 
              className={`px-1 py-0.5 rounded text-xs ${
                isCompleted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {reading.length > 10 ? `${reading.substring(0, 10)}...` : reading}
            </div>
          ))}
          {readings.length > 2 && (
            <div className="text-xs text-gray-500">+{readings.length - 2} 更多</div>
          )}
        </div>
      </div>
    )
  }

  const tileClassName = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0]
    const readings = plan[dateString]
    const isCompleted = progress.has(dateString)
    const today = new Date().toISOString().split('T')[0]

    let className = 'relative min-h-[80px] p-2 '

    if (readings) {
      if (isCompleted) {
        // 完成的日子：綠色背景更明顯
        className += 'bg-green-200 border-green-400 hover:bg-green-300 '
      } else if (dateString === today) {
        // 今天：淺黃色背景
        className += 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200 ring-2 ring-yellow-400 '
      } else {
        // 其他有計劃的日子：白色背景
        className += 'bg-white border-gray-200 hover:bg-gray-50 '
      }
    } else {
      className += 'bg-gray-50 '
    }

    return className
  }

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
          navigationLabel={({ date }) => `${date.getMonth() + 1}月`}
          prevLabel="‹"
          nextLabel="›"
          prev2Label={null}
          next2Label={null}
          locale="zh-TW"
          formatShortWeekday={(locale, date) => {
            const weekdays = ['日', '一', '二', '三', '四', '五', '六']
            return weekdays[date.getDay()]
          }}
        />
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
        .calendar-container :global(.react-calendar) {
          width: 100%;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-family: inherit;
          line-height: 1.125em;
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
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75em;
          color: #6b7280;
          background: #f9fafb;
        }
        
        .calendar-container :global(.react-calendar__month-view__weekdays__weekday) {
          padding: 0.5em;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .calendar-container :global(.react-calendar__tile) {
          max-width: 100%;
          background: none !important;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s ease;
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