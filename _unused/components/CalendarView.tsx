'use client'

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { createClient } from '@/lib/supabase/client'
import { BIBLE_ABBREVIATIONS } from '@/lib/bibleAbbreviations'
import { parseReadingPlan, getHongKongToday, isHongKongToday } from '@/lib/chineseBibleAbbreviations'
// Lazy load confetti for iOS compatibility
const confetti = typeof window !== 'undefined' ? 
  require('canvas-confetti') : 
  null
import type { User } from '@supabase/supabase-js'

interface CalendarViewProps {
  plan: { [date: string]: string[] };
  progress: Set<string>;
  setProgress: React.Dispatch<React.SetStateAction<Set<string>>>;
  user: User;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarView({ plan, progress, setProgress, user }: CalendarViewProps) {
  const supabase = createClient()

  // Force Sunday start by ensuring correct weekday mapping
  const formatWeekday = (locale: string | undefined, date: Date) => {
    // Ensure Sunday (0) maps to index 0 ('日'), Monday (1) to index 1 ('一'), etc.
    return WEEKDAYS[date.getDay()]
  }

  const handleDayClick = async (value: Date) => {
    const dateString = value.toISOString().split('T')[0]
    
    // 嚴格檢查：只允許點擊有讀經計劃的日期
    if (!plan[dateString] || !Array.isArray(plan[dateString]) || plan[dateString].length === 0) {
      console.log('No reading plan for date:', dateString)
      return
    }

    const isCompleted = progress.has(dateString)
    const originalProgress = new Set(progress)

    // Optimistic UI update
    const newProgress = new Set(originalProgress)
    if (isCompleted) {
      newProgress.delete(dateString)
    } else {
      newProgress.add(dateString)
    }
    setProgress(newProgress)

    // Update database
    const operation = isCompleted
      ? supabase.from('progress').delete().match({ user_id: user.id, read_date: dateString })
      : supabase.from('progress').insert({ read_date: dateString, user_id: user.id })

    const { error } = await operation

    if (error) {
      console.error("Failed to update progress:", error)
      setProgress(originalProgress) // Revert on error
    } else if (!isCompleted && !error) {
      // 只有在新完成讀經計劃時才顯示慶祝動畫
      console.log('Showing confetti for completed reading plan:', dateString)
      if (confetti && typeof confetti === 'function') {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        } catch (error) {
          console.warn('Confetti animation failed:', error);
        }
      }
    }
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0]
      const dayPlan = plan[dateString]
      const isCompleted = progress.has(dateString)
      
      // 完全自定義瓦片內容，包括日期
      return (
        <div className="custom-tile-content">
          <div className="date-number">
            {date.getDate()}
          </div>
          {dayPlan && (
            <div className="plan-info">
              <div className="plan-text">
                {parseReadingPlan(dayPlan)}
              </div>
              {isCompleted && (
                <div className="completion-check">✓</div>
              )}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0]
      const hongKongToday = getHongKongToday()
      const isToday = dateString === hongKongToday
      
      if (progress.has(dateString)) {
        return isToday ? 'bg-green-300 rounded-lg ring-2 ring-blue-400' : 'bg-green-300 rounded-lg' // Completed
      }
      if (plan[dateString]) {
        return isToday ? 'bg-yellow-100 rounded-lg ring-2 ring-blue-400' : 'bg-yellow-100 rounded-lg' // Planned but not completed
      }
      if (isToday) {
        return 'bg-blue-100 rounded-lg ring-2 ring-blue-400' // Today with no plan
      }
    }
    return null
  }

  return (
    <div className="calendar-container">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <LegendItem color="bg-green-400" label="已完成" />
        <LegendItem color="bg-yellow-300" label="待完成" />
        <LegendItem color="bg-blue-300 ring-2 ring-blue-400" label="今日" />
        <LegendItem color="bg-gray-100" label="無計劃" />
      </div>

      <Calendar
        locale="en-US" // Force Sunday start
        formatMonthYear={(locale, date) => `${date.getFullYear()}年${date.getMonth() + 1}月`}
        formatShortWeekday={formatWeekday}
        onClickDay={handleDayClick}
        tileContent={tileContent}
        tileClassName={tileClassName}
        className="w-full border-none modern-calendar"
      />
      
      {/* 今日讀經計劃詳情 */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-3 text-center">
          📖 今日讀經計劃 ({getHongKongToday()})
        </h3>
        
        {plan[getHongKongToday()] ? (
          <div className="space-y-2">
            {plan[getHongKongToday()].map((reading, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                progress.has(getHongKongToday()) 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    progress.has(getHongKongToday())
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {progress.has(getHongKongToday()) ? '✓' : index + 1}
                  </span>
                  <span className="text-gray-700 font-medium">{reading}</span>
                </div>
              </div>
            ))}
            
            {progress.has(getHongKongToday()) && (
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
      
      <style jsx global>{`
        /* Modern Calendar Styles */
        .modern-calendar {
          font-family: 'Inter', sans-serif;
        }
        
        .react-calendar {
          border: none !important;
          background: transparent !important;
          width: 100% !important;
          max-width: none !important;
        }
        
        .react-calendar__navigation {
          margin-bottom: 1.5rem !important;
          height: auto !important;
        }
        
        .react-calendar__navigation button {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 12px !important;
          color: #374151 !important;
          font-weight: 600 !important;
          padding: 12px 16px !important;
          margin: 0 4px !important;
          transition: all 0.3s ease !important;
        }
        
        .react-calendar__navigation button:hover {
          background: #f3f4f6 !important;
          border-color: #6366f1 !important;
          transform: translateY(-1px) !important;
        }
        
        .react-calendar__navigation button:disabled {
          background: #f9fafb !important;
          color: #9ca3af !important;
        }
        
        .react-calendar__month-view__weekdays {
          margin-bottom: 1rem !important;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          padding: 12px 8px !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
          font-size: 0.875rem !important;
          text-align: center !important;
        }
        
        .react-calendar__tile {
          background: white !important;
          border: 2px solid #f3f4f6 !important;
          border-radius: 12px !important;
          margin: 3px !important;
          padding: 12px 8px !important;
          min-height: 100px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-start !important;
          transition: all 0.3s ease !important;
          position: relative !important;
          font-weight: 600 !important;
          flex: 1 !important;
        }
        
        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          gap: 6px !important;
          width: 100% !important;
          grid-auto-rows: minmax(60px, auto) !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          max-width: 100% !important;
        }
        
        .react-calendar__month-view__days__day {
          width: 100% !important;
          min-height: 60px !important;
          max-width: 100% !important;
          overflow: hidden !important;
        }
        
        @media (min-width: 769px) {
          .react-calendar__tile {
            min-height: 120px !important;
            padding: 16px 12px !important;
          }
          
          .react-calendar__month-view__days {
            gap: 8px !important;
          }
          
          .react-calendar__tile abbr {
            font-size: 1.125rem !important;
          }
        }
        
        @media (max-width: 768px) {
          .react-calendar__tile {
            min-height: 60px !important;
            padding: 4px 2px !important;
            margin: 1px !important;
          }
          
          .react-calendar__month-view__weekdays__weekday {
            padding: 8px 4px !important;
            font-size: 0.75rem !important;
            width: calc(100% / 7) !important;
            box-sizing: border-box !important;
          }
          
          .react-calendar__navigation button {
            padding: 8px 12px !important;
            font-size: 0.875rem !important;
          }
          
          .react-calendar__month-view__days {
            gap: 2px !important;
            grid-auto-rows: minmax(50px, auto) !important;
            grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
            width: 100% !important;
          }
          
          .react-calendar__month-view__days__day {
            min-height: 50px !important;
            width: 100% !important;
            max-width: calc(100% / 7 - 4px) !important;
            box-sizing: border-box !important;
          }
          
          .react-calendar__month-view__weekdays {
            display: grid !important;
            grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
            width: 100% !important;
            gap: 2px !important;
          }
        }
        
        @media (max-width: 480px) {
          .react-calendar {
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }
          
          .react-calendar__tile {
            min-height: 45px !important;
            padding: 1px !important;
            font-size: 0.75rem !important;
            margin: 0px !important;
            border-width: 1px !important;
            flex: 1 !important;
            min-width: 0 !important;
          }
          
          .react-calendar__month-view__days {
            gap: 1px !important;
            grid-auto-rows: minmax(40px, auto) !important;
            grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          
          .react-calendar__month-view__days__day {
            min-height: 40px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            flex: 1 !important;
            min-width: 0 !important;
            overflow: hidden !important;
          }
          
          .react-calendar__month-view__weekdays__weekday {
            padding: 2px 1px !important;
            font-size: 0.625rem !important;
            width: 100% !important;
            box-sizing: border-box !important;
            flex: 1 !important;
            min-width: 0 !important;
            text-align: center !important;
          }
          
          .react-calendar__month-view__weekdays {
            display: grid !important;
            grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
            width: 100% !important;
            gap: 1px !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          
          .react-calendar__tile abbr {
            font-size: 0.75rem !important;
            display: block !important;
            text-align: center !important;
          }
        }
        
        .react-calendar__tile:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          border-color: #6366f1 !important;
        }
        
        .react-calendar__tile--now {
          background: #dbeafe !important;
          border-color: #3b82f6 !important;
          color: #1e40af !important;
        }
        
        .react-calendar__tile--now:hover {
          background: #bfdbfe !important;
        }
        
        /* 已完成的日期 */
        .react-calendar__tile.bg-green-300 {
          background: #86efac !important;
          border-color: #22c55e !important;
          color: #166534 !important;
        }
        
        .react-calendar__tile.bg-green-300:hover {
          background: #4ade80 !important;
          border-color: #16a34a !important;
        }
        
        /* 有計劃但未完成的日期 */
        .react-calendar__tile.bg-yellow-100 {
          background: #fef3c7 !important;
          border-color: #f59e0b !important;
          color: #92400e !important;
        }
        
        .react-calendar__tile.bg-yellow-100:hover {
          background: #fde047 !important;
          border-color: #d97706 !important;
        }
        
        /* 今日且已完成 */
        .react-calendar__tile--now.bg-green-300 {
          background: #86efac !important;
          border-color: #22c55e !important;
          color: #166534 !important;
        }
        
        /* 今日且有計劃 */
        .react-calendar__tile--now.bg-yellow-100 {
          background: #fef3c7 !important;
          border-color: #f59e0b !important;
          color: #92400e !important;
        }
        
        /* 確保所有 abbr 元素都被隱藏 */
        .react-calendar__tile abbr,
        .react-calendar__tile > abbr,
        .react-calendar__tile abbr[title] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          position: absolute !important;
          left: -9999px !important;
        }
        
        /* 隱藏默認的 abbr 元素，使用我們的自定義內容 */
        .react-calendar__tile abbr {
          display: none !important;
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
        }
        
        @media (max-width: 480px) {
          .date-number {
            font-size: 0.75rem !important;
            margin-bottom: 1px !important;
          }
          
          .plan-text {
            font-size: 0.4rem !important;
            line-height: 0.9 !important;
          }
          
          .completion-check {
            font-size: 0.625rem !important;
          }
          
          .custom-tile-content {
            padding: 1px !important;
          }
        }
      `}</style>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-4 h-4 ${color} rounded border-2 border-gray-300`}></div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}
